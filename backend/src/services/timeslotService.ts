import courtRepository from '~/repository/courtRepository'
import timeSlotRepository from '~/repository/timeslotRepository'
import AppError from '~/utils/appError'
import centerService from './centerService'
import centerRepository from '~/repository/centerRepository'
import priceRepository from '~/repository/priceRepository'
interface ITimeSlotService {
  getFreeStartTimeByCenterAndDate(centerId: string, date: string): Promise<any[]>
  getMaxTimeAviableFromStartTime(centerId: string, date: string, startTime: string): Promise<number | null>
  getCourtByFreeSlot(centerId: string, date: string, start: string, duration: number): Promise<any[] | null>
  getPriceFormStartoEnd(centerId: string, start: string, end: string): Promise<number | null>
  checkAndUpdateTimeSlots(): Promise<any>
  // getFreeStartTimeByCenterAndDateByMonth(centerId: string, date: string): Promise<any[]>
  getFreeStartTimeByCenterAndDateForUpdate(
    centerId: string,
    date: string,
    oldStart: string,
    oldEnd: string,
    oldCourtId: string
  ): Promise<any[]>
  getMaxTimeAviableFromStartTimeForUpdate(
    centerId: string,
    date: string,
    startTime: string,
    oldStart: string,
    oldEnd: string,
    oldCourtId: string
  ): Promise<number | null>
  getCourtByFreeSlotForUpdate(
    centerid: string,
    date: string,
    start: string,
    duration: number,
    oldStart: string,
    oldEnd: string,
    oldCourtId: string
  ): Promise<any[] | null>
}
class timeSlotService implements ITimeSlotService {
  async getFreeStartTimeByCenterAndDate(centerId: string, date: string) {
    const isoDate = new Date(`${date}T00:00:00.000Z`)
    const courtRepositoryInstance = new courtRepository()
    const listcourtId = await courtRepositoryInstance.getListCourtId({ centerId: centerId })
    const startTimes = new Set()
    const timeSlotRepositoryInstance = new timeSlotRepository()
    for (const courtId of listcourtId) {
      const timeSlots = await timeSlotRepositoryInstance.getTimeslot({ courtId, date: isoDate })
      if (timeSlots) {
        const freeSlots = timeSlots.slot.filter(
          (slot) => slot.status !== 'booked' && slot.status !== 'booking' && slot.status !== 'expired'
        )
        for (const slot of freeSlots) {
          startTimes.add(slot.start)
        }
      }
    }
    const sortedStartTimes = Array.from(startTimes).sort()
    return sortedStartTimes
  }

  async getMaxTimeAviableFromStartTime(centerId: string, date: string, startTime: string) {
    const isoDate = new Date(`${date}T00:00:00.000Z`)
    const courtRepositoryInstance = new courtRepository()
    const listcourtId = await courtRepositoryInstance.getListCourtId({ centerId })
    // if (listcourtId.length === 0) {
    //   return null
    // }
    const listMinStartTime = []
    const datePrefix = '1970-01-01T'
    const timeSlotRepositoryInstance = new timeSlotRepository()
    for (const courtId of listcourtId) {
      const timeSlots = await timeSlotRepositoryInstance.getTimeslot({ courtId, date: isoDate })
      if (timeSlots) {
        const bookedSlots = timeSlots.slot.filter(
          (slot) =>
            (slot.status === 'booked' || slot.status === 'booking' || slot.status === 'expired') &&
            slot.start >= startTime
        )
        if (bookedSlots.length > 1) {
          const StartTimeBooked = []
          for (const slot of bookedSlots) {
            StartTimeBooked.push(slot.start)
          }
          const minStartTime = Math.min(...StartTimeBooked.map((time) => new Date(datePrefix + time + 'Z').getTime()))
          listMinStartTime.push(minStartTime)
        }
        if (bookedSlots.length == 0) {
          const maxEndTime = Math.max(...timeSlots.slot.map((slot) => new Date(datePrefix + slot.end + 'Z').getTime()))
          listMinStartTime.push(maxEndTime)
        }
      }
    }

    if (listMinStartTime.length === 0) {
      return null
    }
    const maxEndTimeInMilliseconds = Math.max(...listMinStartTime)
    const maxEndTimeAviable = new Date(maxEndTimeInMilliseconds).toISOString().substr(11, 5)
    if (maxEndTimeAviable === null) {
      return null
    }
    let maxAvailableTime =
      new Date(datePrefix + maxEndTimeAviable + 'Z').getTime() - new Date(datePrefix + startTime + 'Z').getTime()
    if (maxAvailableTime < 0) {
      return null
    }
    maxAvailableTime = maxAvailableTime / 60 / 60 / 1000
    return maxAvailableTime
  }

  async getCourtByFreeSlot(centerid: string, date: string, start: string, duration: number) {
    const isoDate = new Date(`${date}T00:00:00.000Z`)
    const courtRepositoryInstance = new courtRepository()
    const listcourtId = await courtRepositoryInstance.getListCourtId({ centerId: centerid })
    const centerRepositoryInstance = new centerRepository()
    const CenterTime = await centerRepositoryInstance.getCenterStartandEndTime({ _id: centerid })
    if (CenterTime) {
      const [centerClosehours, centerCloseminutes] = CenterTime.closeTime.split(':').map(Number)
      const centerClose = centerClosehours * 60 + centerCloseminutes
      const [startHours, startMinutes] = start.split(':').map(Number)
      const startSlot = startHours * 60 + startMinutes
      const durationAvailable = (centerClose - startSlot) / 60
      if (duration > durationAvailable) {
        return null
      }

      const datePrefix = '1970-01-01T'
      const startTimeDate = new Date(`${datePrefix}${start}:00Z`)
      duration = duration * 60 * 60 * 1000
      const endTime = new Date(startTimeDate.getTime() + duration)
      const endHours = endTime.getUTCHours().toString().padStart(2, '0')
      const endMinutes = endTime.getUTCMinutes().toString().padStart(2, '0')
      const formattedEndTime = `${endHours}:${endMinutes}`
      const totalPrice = await this.getPriceFormStartoEnd(centerid, start, formattedEndTime)
      const availableCourt = []
      const timeSlotRepositoryInstance = new timeSlotRepository()
      for (const courtId of listcourtId) {
        const timeSlots = await timeSlotRepositoryInstance.getTimeslot({ courtId, date: isoDate })
        let isAvailable = true
        if (timeSlots) {
          const bookedSlots = (timeSlots.slot as Array<any>).filter(
            (slot) => slot.status === 'booked' || slot.status === 'booking'
          )

          for (const slot of bookedSlots) {
            if (slot.start >= start && slot.end <= formattedEndTime) {
              isAvailable = false
              break
            }
          }
        }
        if (isAvailable) {
          const courtRepositoryInstance = new courtRepository()
          let court: any = await courtRepositoryInstance.getCourt({ _id: courtId })
          court.price = totalPrice
          court = { ...court._doc, price: totalPrice }
          availableCourt.push(court)
        }
      }
      return availableCourt
    }
    return null
  }

  async getPriceFormStartoEnd(centerId: string, start: string, end: string) {
    const [startHours, startMinutes] = start.split(':').map(Number)
    let startSlot = startHours * 60 + startMinutes
    const [endHours, endMinutes] = end.split(':').map(Number)
    const endslot = endHours * 60 + endMinutes
    const slotFormStarttoEndInMinutes = []
    while (startSlot < endslot) {
      slotFormStarttoEndInMinutes.push(startSlot)
      startSlot += 30
    }
    let totalprice = 0
    const priceRepositoryInstance = new priceRepository()
    const normalPrice = await priceRepositoryInstance.getPrice({
      centerId: centerId,
      scheduleType: 'NP'
    })
    console.log('normalPrice', normalPrice)
    const GoldenPrice = await priceRepositoryInstance.getPrice({
      centerId: centerId,
      scheduleType: 'GP'
    })
    if (!normalPrice) {
      return null
    }
    if (!GoldenPrice) {
      for (const slot of slotFormStarttoEndInMinutes) {
        totalprice += normalPrice.price
      }
    }
    if (GoldenPrice) {
      const GoldenPriceStartInMinutes = +GoldenPrice.startTime.split(':')[0] * 60 + +GoldenPrice.startTime.split(':')[1]
      const GoldenPriceEndInMinutes = +GoldenPrice.endTime.split(':')[0] * 60 + +GoldenPrice.endTime.split(':')[1]
      for (const slot of slotFormStarttoEndInMinutes) {
        if (slot >= GoldenPriceStartInMinutes && slot < GoldenPriceEndInMinutes) {
          totalprice += GoldenPrice.price / 2
        } else {
          totalprice += normalPrice.price / 2
        }
      }
    }
    return totalprice
  }

  async checkAndUpdateTimeSlots() {
    const currentTime = new Date()
    currentTime.setMinutes(currentTime.getMinutes() + 30)
    const hours = currentTime.getHours()
    let minutes = currentTime.getMinutes()

    // Round down to the nearest half hour
    minutes = Math.floor(minutes / 30) * 30

    // Format hours and minutes as 2 digits
    const formattedHours = hours < 10 ? '0' + hours : hours
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes

    const formattedTime = `${formattedHours}:${formattedMinutes}`
    const now = new Date()
    now.setUTCHours(0, 0, 0, 0)
    const timeSlotRepositoryInstance = new timeSlotRepository()
    const listTimeSlots = await timeSlotRepositoryInstance.getListTimeslot({ date: now.toISOString() })
    await Promise.all(
      listTimeSlots.map(async (timeSlot) => {
        const courtId = timeSlot.courtId.toString()
        const date = timeSlot.date
        const slots = timeSlot.slot

        return Promise.all(
          slots.map(async (slot) => {
            if (slot.status === 'available' && slot.start <= formattedTime) {
              await timeSlotRepositoryInstance.updateSlotStatus(
                { courtId, date, start: slot.start, end: slot.end },
                'expired'
              )
            }
          })
        )
      })
    )
  }

  async getFreeStartTimeByCenterAndDateForUpdate(
    centerId: string,
    date: string,
    oldStart: string,
    oldEnd: string,
    oldCourtId: string
  ) {
    const isoDate = new Date(`${date}T00:00:00.000Z`)
    const courtRepositoryInstance = new courtRepository()
    const listcourtId = await courtRepositoryInstance.getListCourtId({ centerId: centerId })
    const startTimes = new Set()
    const timeSlotRepositoryInstance = new timeSlotRepository()
    for (const courtId of listcourtId) {
      const timeSlots = await timeSlotRepositoryInstance.getTimeslot({ courtId, date: isoDate })

      if (timeSlots) {
        const freeSlots = timeSlots.slot.filter(
          (slot) => slot.status !== 'booked' && slot.status !== 'booking' && slot.status !== 'expired'
        )
        for (const slot of freeSlots) {
          startTimes.add(slot.start)
        }
      }
    }
    const sortedStartTimes = Array.from(startTimes).sort()
    return sortedStartTimes
  }

  async getMaxTimeAviableFromStartTimeForUpdate(
    centerId: string,
    date: string,
    startTime: string,
    oldStart: string,
    oldEnd: string,
    oldCourtId: string
  ) {
    console.log('oldStart', oldStart)
    console.log('oldEnd', oldEnd)
    const isoDate = new Date(`${date}T00:00:00.000Z`)
    const courtRepositoryInstance = new courtRepository()
    const listcourtId = await courtRepositoryInstance.getListCourtId({ centerId })
    if (listcourtId.length === 0) {
      return null
    }
    const listMinStartTime = []
    const datePrefix = '1970-01-01T'
    const timeSlotRepositoryInstance = new timeSlotRepository()
    let bookedSlots = []
    for (const courtId of listcourtId) {
      const timeSlots = await timeSlotRepositoryInstance.getTimeslot({ courtId, date: isoDate })
      if (timeSlots) {
        if (oldCourtId === timeSlots.courtId.toString()) {
          bookedSlots = timeSlots.slot.filter(
            (slot) =>
              ((slot.status === 'booked' && !(oldStart <= slot.start && slot.end <= oldEnd)) ||
                slot.status === 'booking' ||
                slot.status === 'expired') &&
              slot.start >= startTime
          )
        } else {
          bookedSlots = timeSlots.slot.filter(
            (slot) =>
              (slot.status === 'booked' || slot.status === 'booking' || slot.status === 'expired') &&
              slot.start >= startTime
          )
        }

        if (bookedSlots.length > 1) {
          const StartTimeBooked = []
          for (const slot of bookedSlots) {
            StartTimeBooked.push(slot.start)
          }
          const minStartTime = Math.min(...StartTimeBooked.map((time) => new Date(datePrefix + time + 'Z').getTime()))
          listMinStartTime.push(minStartTime)
        }
        if (bookedSlots.length == 0) {
          const maxEndTime = Math.max(...timeSlots.slot.map((slot) => new Date(datePrefix + slot.end + 'Z').getTime()))
          listMinStartTime.push(maxEndTime)
        }
      }
    }

    if (listMinStartTime.length === 0) {
      return null
    }
    const maxEndTimeInMilliseconds = Math.max(...listMinStartTime)
    const maxEndTimeAviable = new Date(maxEndTimeInMilliseconds).toISOString().substr(11, 5)
    if (maxEndTimeAviable === null) {
      return null
    }
    let maxAvailableTime =
      new Date(datePrefix + maxEndTimeAviable + 'Z').getTime() - new Date(datePrefix + startTime + 'Z').getTime()
    if (maxAvailableTime < 0) {
      return null
    }
    maxAvailableTime = maxAvailableTime / 60 / 60 / 1000
    return maxAvailableTime
  }

  async getCourtByFreeSlotForUpdate(
    centerid: string,
    date: string,
    start: string,
    duration: number,
    oldStart: string,
    oldEnd: string,
    oldCourtId: string
  ) {
    const isoDate = new Date(`${date}T00:00:00.000Z`)
    const courtRepositoryInstance = new courtRepository()
    const listcourtId = await courtRepositoryInstance.getListCourtId({ centerId: centerid })
    const centerRepositoryInstance = new centerRepository()
    const CenterTime = await centerRepositoryInstance.getCenterStartandEndTime({ _id: centerid })
    if (CenterTime) {
      const [centerClosehours, centerCloseminutes] = CenterTime.closeTime.split(':').map(Number)
      const centerClose = centerClosehours * 60 + centerCloseminutes
      const [startHours, startMinutes] = start.split(':').map(Number)
      const startSlot = startHours * 60 + startMinutes
      const durationAvailable = (centerClose - startSlot) / 60
      if (duration > durationAvailable) {
        return null
      }

      const datePrefix = '1970-01-01T'
      const startTimeDate = new Date(`${datePrefix}${start}:00Z`)
      duration = duration * 60 * 60 * 1000
      const endTime = new Date(startTimeDate.getTime() + duration)
      const endHours = endTime.getUTCHours().toString().padStart(2, '0')
      const endMinutes = endTime.getUTCMinutes().toString().padStart(2, '0')
      const formattedEndTime = `${endHours}:${endMinutes}`
      const totalPrice = await this.getPriceFormStartoEnd(centerid, start, formattedEndTime)
      const availableCourt = []
      const timeSlotRepositoryInstance = new timeSlotRepository()
      for (const courtId of listcourtId) {
        const timeSlots = await timeSlotRepositoryInstance.getTimeslot({ courtId, date: isoDate })
        let isAvailable = true
        let bookedSlots = []
        if (timeSlots) {
          if (oldCourtId === timeSlots.courtId.toString()) {
            bookedSlots = (timeSlots.slot as Array<any>).filter(
              (slot) =>
                (slot.status === 'booked' && !(oldStart <= slot.start && slot.end <= oldEnd)) ||
                slot.status === 'booking'
            )
          } else {
            bookedSlots = (timeSlots.slot as Array<any>).filter(
              (slot) => slot.status === 'booked' || slot.status === 'booking'
            )
          }

          for (const slot of bookedSlots) {
            if (slot.start >= start && slot.end <= formattedEndTime) {
              isAvailable = false
              break
            }
          }
        }
        if (isAvailable) {
          const courtRepositoryInstance = new courtRepository()
          let court: any = await courtRepositoryInstance.getCourt({ _id: courtId })
          court.price = totalPrice
          court = { ...court._doc, price: totalPrice }
          availableCourt.push(court)
        }
      }
      return availableCourt
    }
    return null
  }
}
export default timeSlotService
