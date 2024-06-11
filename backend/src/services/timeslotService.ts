import courtRepository from '~/repository/courtRepository'
import timeSlotRepository from '~/repository/timeslotRepository'
import AppError from '~/utils/appError'
import centerService from './centerService'
import centerRepository from '~/repository/centerRepository'
import priceRepository from '~/repository/priceRepository'

class timeSlotService {
  static async getFreeStartTimeByCenterAndDate(centerId: string, date: string) {
    const isoDate = new Date(`${date}T00:00:00.000Z`)
    const listcourtId = await courtRepository.getListCourtId({ centerId: centerId })
    const startTimes = new Set()
    const timeSlotRepositoryInstance = new timeSlotRepository()
    for (const courtId of listcourtId) {
      const timeSlots = await timeSlotRepositoryInstance.getTimeslot({ courtId, date: isoDate })
      if (timeSlots) {
        const freeSlots = timeSlots.slot.filter((slot) => slot.status !== 'booked')
        for (const slot of freeSlots) {
          startTimes.add(slot.start)
        }
      }
    }
    return Array.from(startTimes)
  }

  static async getMaxTimeAviableFromStartTime(centerId: string, date: string, startTime: string) {
    const isoDate = new Date(`${date}T00:00:00.000Z`)
    const listcourtId = await courtRepository.getListCourtId({ centerId })
    if (listcourtId.length === 0) {
      return null
    }
    const listMinStartTime = []
    const datePrefix = '1970-01-01T'
    const timeSlotRepositoryInstance = new timeSlotRepository()
    for (const courtId of listcourtId) {
      const timeSlots = await timeSlotRepositoryInstance.getTimeslot({ courtId, date: isoDate })
      if (timeSlots) {
        const bookedSlots = timeSlots.slot.filter((slot) => slot.status == 'booked' && slot.start >= startTime)
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

  static async getCourtByFreeSlot(centerid: string, date: string, start: string, duration: number) {
    const isoDate = new Date(`${date}T00:00:00.000Z`)
    const listcourtId = await courtRepository.getListCourtId({ centerId: centerid })
    const CenterTime = await centerRepository.getCenterStartandEndTime({ _id: centerid })
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
          const bookedSlots = (timeSlots.slot as Array<any>).filter((slot) => slot.status == 'booked')

          for (const slot of bookedSlots) {
            if (slot.start >= start && slot.end <= formattedEndTime) {
              isAvailable = false
              break
            }
          }
        }
        if (isAvailable) {
          let court: any = await courtRepository.getCourt({ _id: courtId })
          court.price = totalPrice
          court = { ...court._doc, price: totalPrice }
          availableCourt.push(court)
        }
      }
      return availableCourt
    }
  }

  static async getPriceFormStartoEnd(centerId: string, start: string, end: string) {
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
    const nomalPrice = await priceRepository.getPrice({
      centerId: centerId,
      scheduleType: 'nomalPrice'
    })
    const GoldenPrice = await priceRepository.getPrice({
      centerId: centerId,
      scheduleType: 'GoldenPrice'
    })
    if (!nomalPrice) {
      return null
    }
    if (!GoldenPrice) {
      for (const slot of slotFormStarttoEndInMinutes) {
        totalprice += nomalPrice.price
      }
    }
    if (GoldenPrice) {
      const GoldenPriceStartInMinutes = +GoldenPrice.startTime.split(':')[0] * 60 + +GoldenPrice.startTime.split(':')[1]
      const GoldenPriceEndInMinutes = +GoldenPrice.endTime.split(':')[0] * 60 + +GoldenPrice.endTime.split(':')[1]
      for (const slot of slotFormStarttoEndInMinutes) {
        if (slot >= GoldenPriceStartInMinutes && slot < GoldenPriceEndInMinutes) {
          totalprice += GoldenPrice.price / 2
        } else {
          totalprice += nomalPrice.price / 2
        }
      }
    }
    return totalprice
  }
}
export default timeSlotService
