import bookingRepository from '~/repository/bookingRepository'
import { ObjectId } from 'mongodb'
import timeSlotRepository from '~/repository/timeslotRepository'
import AppError from '~/utils/appError'
import InvoiceService from './invoiceService'
import centerService from './centerService'
import momoService from './momoService'
import InvoiceRepository from '~/repository/invoiceReposotory'
import courtRepository from '~/repository/courtRepository'
import userRepository from '~/repository/userRepository'
import centerRepository from '~/repository/centerRepository'
import timeSlotService from './timeslotService'
import PlayHour from '../models/playHoursModel'

import bcryptjs from 'bcryptjs'

import { stat } from 'fs'
import sendEmailSerVice from './sendEmailService'
import CenterRepository from '~/repository/centerRepository'
interface IbookingService {
  createBookingbyDay(listBooking: [any], userId: string): Promise<any>
  checkAllSlotsAvailability(listBooking: [any]): Promise<boolean>
  createBooking(data: any, userId: string): Promise<any>
  getPersonalBooking(userId: string): Promise<any>
  UpdateBookingbyDayIncreasePrice(data: any, userId: string): Promise<any>
  UpdateBookingbyDayDecreasePrice(data: any, userId: string): Promise<any>
  getBookingByInvoiceId(invoiceId: string): Promise<any>
  completedBooking(bookingId: string, userId: string): Promise<any>
  getConfirmedBookingByDay(dateFrom: string, dateTo: string, centerId: string): Promise<any>
  bookingDirectly(data: any): Promise<any>
}
class bookingService implements IbookingService {
  async createBookingbyDay(listBooking: any, userId: string) {
    const allSlotsAvailable = await this.checkAllSlotsAvailability(listBooking)
    if (!allSlotsAvailable) {
      throw new AppError('Xin lỗi slot đã được đặt hoặc đang được đặt, kiểm tra lại booking', 400)
    }
    //chuyển hướng tới payment nhận response từ payment
    const userHour = await PlayHour.find
    const orderId = 'RR' + new Date().getTime()
    const InvoiceServiceInstance = new InvoiceService()
    let totalprice = 0
    const newInvoice = await InvoiceServiceInstance.addInvoiceBookingbyDay(totalprice, userId, orderId)
    const timeSlotServiceInstance = new timeSlotService()
    const listnewbooking = await Promise.all(
      listBooking.map(async (booking: any) => {
        booking.invoiceId = newInvoice._id
        const PricePerBooking = await timeSlotServiceInstance.getPriceFormStartoEnd(
          booking.centerId,
          booking.start,
          booking.end
        )
        if (PricePerBooking) {
          booking.price = PricePerBooking
          totalprice += PricePerBooking
        }
        const newbooking = await this.createBooking(booking, userId)
        return newbooking
      })
    )
    const InvoiceRepositoryInstance = new InvoiceRepository()
    const updateInvoice = await InvoiceRepositoryInstance.updateInvoice({ _id: newInvoice._id }, { price: totalprice })
    const bookingDetail = listBooking.map((booking: { date: any; start: any; end: any }) => {
      return `${booking.date} (${booking.start} - ${booking.end})`
    })

    const centerId = listBooking[0].centerId
    const centerServiceInstance = new centerService()
    const center = await centerServiceInstance.getCenterById(centerId)
    const orderInfo = 'Thanh toán đặt sân' + center.centerName + bookingDetail.join(',')
    const callbackUrl = '/api/v1/booking/callback-pay-booking-by-day'
    const redirect = '/user/bill'
    const paymentResult = await momoService.createPayment(
      orderInfo,
      totalprice,
      orderId,
      centerId,
      callbackUrl,
      '',
      redirect
    )
    return paymentResult
  }

  async createBookingByDayWithHour(listBooking: any, userId: string) {
    const allSlotsAvailable = await this.checkAllSlotsAvailability(listBooking)
    if (!allSlotsAvailable) {
      throw new AppError('Xin lỗi slot đã được đặt hoặc đang được đặt, kiểm tra lại booking', 400)
    }
    //chuyển hướng tới payment nhận response từ payment

    const orderId = 'RR' + new Date().getTime()
    const InvoiceServiceInstance = new InvoiceService()
    let totalprice = 0
    const newInvoice = await InvoiceServiceInstance.addInvoiceBookingbyDay(totalprice, userId, orderId)
    const timeSlotServiceInstance = new timeSlotService()
    const listnewbooking = await Promise.all(
      listBooking.map(async (booking: any) => {
        booking.invoiceId = newInvoice._id
        const PricePerBooking = await timeSlotServiceInstance.getPriceFormStartoEnd(
          booking.centerId,
          booking.start,
          booking.end
        )
        if (PricePerBooking) {
          booking.price = PricePerBooking
          totalprice += PricePerBooking
        }
        const newbooking = await this.createBooking(booking, userId)
        return newbooking
      })
    )
    const InvoiceRepositoryInstance = new InvoiceRepository()
    const updateInvoice = await InvoiceRepositoryInstance.updateInvoice({ _id: newInvoice._id }, { price: totalprice })
    const bookingDetail = listBooking.map((booking: { date: any; start: any; end: any }) => {
      return `${booking.date} (${booking.start} - ${booking.end})`
    })
    const centerId = listBooking[0].centerId
    const centerServiceInstance = new centerService()
    const center = await centerServiceInstance.getCenterById(centerId)
    const orderInfo = 'Thanh toán đặt sân' + center.centerName + bookingDetail.join(',')
    const callbackUrl = '/api/v1/booking/callback-pay-booking-by-day'
    const redirect = '/user/bill'
    const paymentResult = await momoService.createPayment(
      orderInfo,
      totalprice,
      orderId,
      centerId,
      callbackUrl,
      '',
      redirect
    )
    return paymentResult
  }

  async createBooking(data: any, userId: string) {
    const slot = {
      courtId: data.courtId,
      date: data.date,
      start: data.start,
      end: data.start
    }

    const slotAvailable = []
    const timeSlotRepositoryInstance = new timeSlotRepository()

    while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${data.end}:00`)) {
      const [hour, minute] = slot.start.split(':')
      if (minute === '00') {
        slot.end = `${hour}:30`
      } else {
        slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
      }
      slotAvailable.push({ ...slot })
      slot.start = slot.end
    }
    const booking = { ...data, userId: userId, status: 'pending' }
    const newBooking = await bookingRepository.createBooking(booking)

    // Cập nhật trạng thái của các slot thành "booking"
    await Promise.all(
      slotAvailable.map(async (slot) => {
        await timeSlotRepositoryInstance.updateSlotStatus(slot, 'booking')
      })
    )
    return newBooking
  }

  async checkAllSlotsAvailability(listBooking: [any]) {
    const timeSlotRepositoryInstance = new timeSlotRepository()
    for (const booking of listBooking) {
      const slot = {
        courtId: booking.courtId,
        date: booking.date,
        start: booking.start,
        end: booking.start
      }
      while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${booking.end}:00`)) {
        const [hour, minute] = slot.start.split(':')
        if (minute === '00') {
          slot.end = `${hour}:30`
        }
        if (minute === '30') {
          slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
        }
        //check slot trong khoảng booking có available không
        const available = await timeSlotRepositoryInstance.checkTimeSlotAvailable(slot)
        if (!available) {
          return false
        }
        slot.start = slot.end
      }
    }
    return true
  }

  async createBookingWithAvailabilityCheck(data: any, userId: string) {
    const slot = {
      courtId: data.courtId,
      date: data.date,
      start: data.start,
      end: data.start
    }

    const slotAvailable = []
    const timeSlotRepositoryInstance = new timeSlotRepository()

    // Check all slots availability
    const listBooking = [data]
    for (const booking of listBooking) {
      const checkSlot = {
        courtId: booking.courtId,
        date: booking.date,
        start: booking.start,
        end: booking.start
      }
      while (new Date(`1970-01-01T${checkSlot.end}:00`) < new Date(`1970-01-01T${booking.end}:00`)) {
        const [hour, minute] = checkSlot.start.split(':')
        if (minute === '00') {
          checkSlot.end = `${hour}:30`
        }
        if (minute === '30') {
          checkSlot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
        }
        const available = await timeSlotRepositoryInstance.checkTimeSlotAvailable(checkSlot)
        if (!available) {
          throw new AppError('Slot not available', 400)
        }
        checkSlot.start = checkSlot.end
      }
    }

    // Proceed with creating the booking
    while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${data.end}:00`)) {
      const [hour, minute] = slot.start.split(':')
      if (minute === '00') {
        slot.end = `${hour}:30`
      } else {
        slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
      }
      slotAvailable.push({ ...slot })
      slot.start = slot.end
    }

    const booking = { ...data, userId: userId, status: 'pending' }
    const newBooking = await bookingRepository.createBooking(booking)

    // Update slot status to "booking"
    await Promise.all(
      slotAvailable.map(async (slot) => {
        await timeSlotRepositoryInstance.updateSlotStatus(slot, 'booking')
      })
    )

    return newBooking
  }

  async changeBookingStatusAfterPaySuccess(bookingId: string) {
    const booking = await bookingRepository.getBookingbyId(bookingId)
    console.log('bookingAfterSuccess', booking)
    if (!booking) {
      throw new AppError('Booking not found', 404)
    }
    const slot = {
      courtId: booking.courtId.toString(),
      date: booking.date,
      start: booking.start,
      end: booking.start
    }
    const slotAvailable = []
    const timeSlotRepositoryInstance = new timeSlotRepository()
    while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${booking.end}:00`)) {
      const [hour, minute] = slot.start.split(':')
      if (minute === '00') {
        slot.end = `${hour}:30`
      } else {
        slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
      }
      slotAvailable.push({ ...slot })
      slot.start = slot.end
    }
    // Cập nhật trạng thái của các slot thành "booked"
    await Promise.all(
      slotAvailable.map(async (slot) => {
        await timeSlotRepositoryInstance.updateSlotStatus(slot, 'booked')
      })
    )
    booking.status = 'confirmed'
    return bookingRepository.updateBooking({ _id: booking._id }, booking)
  }

  async changeBookingStatusAfterPayFail(bookingId: string) {
    const booking = await bookingRepository.getBookingbyId(bookingId)
    console.log('bookingAfterPayFail', booking)
    if (!booking) {
      throw new AppError('Booking not found', 404)
    }
    const slot = {
      courtId: booking.courtId.toString(),
      date: booking.date,
      start: booking.start,
      end: booking.start
    }
    const slotAvailable = []
    const timeSlotRepositoryInstance = new timeSlotRepository()
    while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${booking.end}:00`)) {
      const [hour, minute] = slot.start.split(':')
      if (minute === '00') {
        slot.end = `${hour}:30`
      } else {
        slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
      }
      slotAvailable.push({ ...slot })
      slot.start = slot.end
    }
    // Cập nhật trạng thái của các slot thành "booked"
    await Promise.all(
      slotAvailable.map(async (slot) => {
        await timeSlotRepositoryInstance.updateSlotStatus(slot, 'available')
      })
    )
    return bookingRepository.deleteBooking({ _id: booking._id })
  }

  async callbackPayBookingByDay(reqBody: any) {
    console.log('vao dc callback', reqBody)
    const invoiceServiceInstance = new InvoiceService()
    if (reqBody.resultCode !== 0) {
      console.log('vao fail')
      const invoice = await invoiceServiceInstance.getInvoicesByInvoiceID(reqBody.orderId)
      const listBooking = await bookingRepository.getListBooking({ invoiceId: invoice._id })
      await Promise.all(
        listBooking.map(async (booking: any) => {
          await this.changeBookingStatusAfterPayFail(booking._id)
        })
      )
      await invoiceServiceInstance.deleteInvoiceById(invoice._id)
      return { status: 'fail' }
    } else {
      const invoice = await invoiceServiceInstance.paidInvoice(reqBody.orderId)
      if (!invoice) {
        throw new AppError('Invoice not found', 404)
      }
      const listBooking = await bookingRepository.getListBooking({ invoiceId: invoice._id })
      await Promise.all(
        listBooking.map(async (booking: any) => {
          await this.changeBookingStatusAfterPaySuccess(booking._id)
        })
      )
      const bookingDetailsPromises = listBooking.map(async (booking: any) => {
        const courtRepositoryInstance = new courtRepository()
        const court = await courtRepositoryInstance.getCourt({ _id: booking.courtId })
        if (court) {
          return `Sân: ${court.courtNumber}, Ngày: ${booking.date.toLocaleDateString()}, Giờ: ${booking.start} - ${booking.end}`
        }
        return ''
      })
      const bookingDetailsArray = await Promise.all(bookingDetailsPromises)
      const bookingDetails = bookingDetailsArray.filter((detail) => detail).join('<br>')
      console.log('bookingDetails', bookingDetails)

      const userRepositoryInstance = new userRepository()
      const user = await userRepositoryInstance.findUser({ _id: listBooking[0].userId })
      if (!user) {
        throw new AppError('user not found', 404)
      }
      const email = user.userEmail
      const centerRepositoryInstance = new CenterRepository()
      const center = await centerRepositoryInstance.getCenter({ _id: listBooking[0].centerId })
      if (!center) {
        throw new AppError('center not found', 404)
      }

      await sendEmailSerVice.sendEmail(email, {
        subject: 'Đã hoàn thành đặt sân',
        text: `Bạn đã đặt sân thành công ở trung tâm cầu lông ${center.centerName} địa chỉ ${center.location}.\n\n${bookingDetails}`,
        html: `
          <p>Bạn đã đặt sân thành công ở trung tâm cầu lông ${center.centerName}</p>
          </br>
          <p>Địa chỉ: ${center.location}</p>
          </br>
          <p>${bookingDetails}</p>
        `
      })

      return { status: 'success' }
    }
  }

  async getBookingByDayAndCenter(centerId: string, date: string) {
    const courtRepositoryInstance = new courtRepository()
    const listCourt = await courtRepositoryInstance.getListCourt({ centerId })
    console.log('date', date)
    const userRepositoryInstance = new userRepository()
    const bookingIncourt: any[] = await Promise.all(
      listCourt.map(async (court: any) => {
        const bookings = await bookingRepository.getListBooking({
          courtId: court._id,
          date: date,
          status: ['confirmed', 'completed', 'expired'] //lấy ra cho chủ sân những status đã xác nhận, hoàn thành, hết hạn
        })
        const bookingsWithUser = await Promise.all(
          bookings.map(async (booking: any) => {
            const user = await userRepositoryInstance.findUser({ _id: booking.userId })
            if (!user)
              return {
                ...booking._doc,
                customerName: 'Khách hàng không tồn tại',
                customerEmail: 'Khách hàng không tồn tại',
                customerPhone: 'Khách hàng không tồn tại'
              }
            return {
              ...booking._doc,
              customerName: user.userName,
              customerEmail: user.userEmail,
              customerPhone: user.userPhone
            }
          })
        )
        return { courtid: court._id, courtnumber: court.courtNumber, bookings: bookingsWithUser }
      })
    )

    console.log('bookingIncourt', bookingIncourt)
    return bookingIncourt
  }

  async getPersonalBooking(userId: string) {
    const bookings = await bookingRepository.getListBooking({ userId })
    const activeBookings = bookings.filter((booking) => booking.status !== 'disable')
    const bookingWithCenterAndCourt = await Promise.all(
      activeBookings.map(async (booking: any) => {
        const centerRepositoryInstance = new centerRepository()
        const center = await centerRepositoryInstance.getCenterById(booking.centerId)
        const courtRepositoryInstance = new courtRepository()
        const court = await courtRepositoryInstance.getCourt({ _id: booking.courtId })
        if (!center || !court) {
          return {
            ...booking._doc,
            centerName: 'Trung tâm không tồn tại',
            centerAddress: 'Trung tâm không tồn tại',
            courtNumber: 'Sân không tồn tại'
          }
        }
        return {
          ...booking._doc,
          centerName: center.centerName,
          centerAddress: center.location,
          courtNumber: court.courtNumber
        }
      })
    )
    return bookingWithCenterAndCourt
  }

  async checkAndUpdateBooking() {
    const currentTime = new Date()
    // currentTime.setMinutes(currentTime.getMinutes() + 30) //sau 30 phut không checkin thì chuyển sang hết hạn
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
    const listBooking = await bookingRepository.getListBooking({ date: now.toISOString(), status: 'confirmed' })
    await Promise.all(
      listBooking.map(async (booking) => {
        if (booking.end <= formattedTime) {
          await bookingRepository.updateBooking({ _id: booking._id }, { status: 'expired' })
        }
      })
    )
  }

  async UpdateBookingbyDayIncreasePrice(data: any, userId: string) {
    if (data.oldPrice >= data.updateBooking.price) {
      throw new AppError('Giá mới không thể thấp hơn hoặc bằng giá cũ', 400)
    }
    console.log('userId', userId)
    console.log('data.updateBooking.userI', data.updateBooking.userId)
    if (userId.toString() !== data.updateBooking.userId) {
      throw new AppError('Bạn không có quyền thay đổi booking này', 403)
    }
    const updateBooking = data.updateBooking
    const oldBooking = await bookingRepository.getBookingbyId(updateBooking._id)
    if (!oldBooking) {
      throw new AppError('Booking not found', 404)
    }
    const centerId = updateBooking.centerId.toString()
    const centerServiceInstance = new centerService()
    const center = await centerServiceInstance.getCenterById(centerId)
    const bookingDetail = `${updateBooking.date} (${updateBooking.start} - ${updateBooking.end})`
    const orderInfo = 'Thanh toán sửa giờ chơi' + center.centerName + bookingDetail
    const callbackUrl = '/api/v1/booking/callback-pay-update-booking-by-day'

    const orderId = 'RRU' + new Date().getTime()
    const InvoiceServiceInstance = new InvoiceService()
    let totalprice = 0
    const newInvoice = await InvoiceServiceInstance.addInvoiceUpdateBookingbyDay(totalprice, userId, orderId)
    totalprice = updateBooking.price - data.oldPrice

    const booking = {
      centerId: updateBooking.centerId,
      courtId: updateBooking.courtId,
      date: updateBooking.date,
      start: updateBooking.start,
      end: updateBooking.end,
      invoiceId: newInvoice._id
    }

    const newbooking = await this.createBookingForUpdate(booking, userId, oldBooking.start, oldBooking.end)
    const InvoiceRepositoryInstance = new InvoiceRepository()
    const updateInvoice = await InvoiceRepositoryInstance.updateInvoice({ _id: newInvoice._id }, { price: totalprice })
    const extraData = JSON.stringify({ oldBookingId: updateBooking._id })
    const redirect = '/user/booking-court'

    const paymentResult = await momoService.createPayment(
      orderInfo,
      totalprice,
      orderId,
      centerId,
      callbackUrl,
      extraData,
      redirect
    )
    return paymentResult
  }

  async createBookingForUpdate(data: any, userId: string, oldStart: string, oldEnd: string) {
    const slot = {
      courtId: data.courtId,
      date: data.date,
      start: data.start,
      end: data.start,
      oldStart: oldStart,
      oldEnd: oldEnd
    }

    const slotAvailable = []
    const timeSlotRepositoryInstance = new timeSlotRepository()

    while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${data.end}:00`)) {
      const [hour, minute] = slot.start.split(':')
      if (minute === '00') {
        slot.end = `${hour}:30`
      } else {
        slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
      }

      const available = await timeSlotRepositoryInstance.checkTimeSlotAvailableForUpdate(slot)
      if (!available) {
        throw new AppError('Slot not available', 400)
      }
      slotAvailable.push({ ...slot })
      slot.start = slot.end
    }
    const timeSlotServiceInstance = new timeSlotService()
    const PricePerBooking = await timeSlotServiceInstance.getPriceFormStartoEnd(data.centerId, data.start, data.end)
    const booking = { ...data, price: PricePerBooking, userId: userId, status: 'pending' }
    const newBooking = await bookingRepository.createBooking(booking)
    console.log('slotAvailable', slotAvailable)
    // Cập nhật trạng thái của các slot thành "booking"
    await Promise.all(
      slotAvailable.map(async (slot) => {
        await timeSlotRepositoryInstance.updateSlotStatus(slot, 'booking')
      })
    )
    return newBooking
  }

  async callbackPayUpdateBookingByDay(reqBody: any) {
    console.log('vao dc callback update', reqBody)
    const extraData = JSON.parse(reqBody.extraData)
    const invoiceServiceInstance = new InvoiceService()
    if (reqBody.resultCode === 0) {
      const oldBooking = await bookingRepository.getBooking({ _id: extraData.oldBookingId })
      if (oldBooking) {
        const slot = {
          courtId: oldBooking.courtId.toString(),
          date: oldBooking.date,
          start: oldBooking.start,
          end: oldBooking.start
        }
        const slotAvailable = []
        const timeSlotRepositoryInstance = new timeSlotRepository()
        while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${oldBooking.end}:00`)) {
          const [hour, minute] = slot.start.split(':')
          if (minute === '00') {
            slot.end = `${hour}:30`
          } else {
            slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
          }
          slotAvailable.push({ ...slot })
          slot.start = slot.end
        }
        // Cập nhật trạng thái của các slot thành "booked"
        await Promise.all(
          slotAvailable.map(async (slot) => {
            await timeSlotRepositoryInstance.updateSlotStatus(slot, 'available')
          })
        )
        oldBooking.status = 'disable'
        console.log('oldBooking', oldBooking)
        bookingRepository.updateBooking({ _id: oldBooking._id }, { status: oldBooking.status })
      }
      const invoice = await invoiceServiceInstance.paidInvoice(reqBody.orderId)
      if (!invoice) {
        throw new AppError('lỗi cập nhật invoice', 401)
      }
      const newBooking = await bookingRepository.getBooking({ invoiceId: invoice._id })
      if (newBooking) {
        await this.changeBookingStatusAfterPaySuccess(newBooking._id.toString())
      }
      return { status: 'success' }
    } else if (reqBody.resultCode !== 0) {
      const oldBooking = await bookingRepository.getBooking({ _id: extraData.oldBookingId })
      const invoice = await invoiceServiceInstance.getInvoicesByInvoiceID(reqBody.orderId)
      const newBooking = await bookingRepository.getBooking({ invoiceId: invoice._id })
      if (newBooking) {
        await this.changeBookingStatusAfterPayFail(newBooking._id.toString())
      }
      if (!oldBooking) {
        throw new AppError('khong tim thay old booking', 401)
      }
      await invoiceServiceInstance.deleteInvoiceById(invoice._id)
      const slot = {
        courtId: oldBooking.courtId.toString(),
        date: oldBooking.date,
        start: oldBooking.start,
        end: oldBooking.start
      }
      const slotAvailable = []
      const timeSlotRepositoryInstance = new timeSlotRepository()
      while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${oldBooking.end}:00`)) {
        const [hour, minute] = slot.start.split(':')
        if (minute === '00') {
          slot.end = `${hour}:30`
        } else {
          slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
        }
        slotAvailable.push({ ...slot })
        slot.start = slot.end
      }
      // Cập nhật trạng thái của các slot thành "booked"
      await Promise.all(
        slotAvailable.map(async (slot) => {
          await timeSlotRepositoryInstance.updateSlotStatus(slot, 'booked')
        })
      )
      return { status: 'fail' }
    }
  }

  async UpdateBookingbyDayDecreasePrice(data: any, userId: string) {
    if (data.oldPrice < data.updateBooking.price) {
      throw new AppError('Giá mới không thể cao hơn giá cũ', 400)
    }
    if (userId.toString() !== data.updateBooking.userId) {
      throw new AppError('Bạn không có quyền thay đổi booking này', 403)
    }
    const updateBooking = data.updateBooking
    const oldBooking = await bookingRepository.getBookingbyId(updateBooking._id)
    if (!oldBooking) {
      throw new AppError('Booking not found', 404)
    }
    if (oldBooking) {
      const slot = {
        courtId: oldBooking.courtId.toString(),
        date: oldBooking.date,
        start: oldBooking.start,
        end: oldBooking.start
      }
      const slotAvailable = []
      const timeSlotRepositoryInstance = new timeSlotRepository()
      while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${oldBooking.end}:00`)) {
        const [hour, minute] = slot.start.split(':')
        if (minute === '00') {
          slot.end = `${hour}:30`
        } else {
          slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
        }
        slotAvailable.push({ ...slot })
        slot.start = slot.end
      }
      await Promise.all(
        slotAvailable.map(async (slot) => {
          await timeSlotRepositoryInstance.updateSlotStatus(slot, 'available')
        })
      )
      oldBooking.status = 'disable'
      console.log('oldBooking', oldBooking)
      bookingRepository.updateBooking({ _id: oldBooking._id }, { status: oldBooking.status })
    }
    updateBooking.status = 'confirmed'
    updateBooking.invoiceId = oldBooking.invoiceId
    updateBooking._id = new ObjectId()
    console.log('updateBooking', updateBooking)
    const newBooking = await bookingRepository.createBooking(updateBooking)
    if (newBooking) {
      const slot = {
        courtId: newBooking.courtId.toString(),
        date: newBooking.date,
        start: newBooking.start,
        end: newBooking.start
      }
      const slotAvailable = []
      const timeSlotRepositoryInstance = new timeSlotRepository()
      while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${newBooking.end}:00`)) {
        const [hour, minute] = slot.start.split(':')
        if (minute === '00') {
          slot.end = `${hour}:30`
        } else {
          slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
        }
        slotAvailable.push({ ...slot })
        slot.start = slot.end
      }
      // Cập nhật trạng thái của các slot thành "booked"
      await Promise.all(
        slotAvailable.map(async (slot) => {
          await timeSlotRepositoryInstance.updateSlotStatus(slot, 'booked')
        })
      )
    }
    return newBooking
  }

  async getBookingByInvoiceId(invoiceId: string) {
    console.log('invoiceId', invoiceId)
    const listBooking = await bookingRepository.getListBooking({ invoiceId: invoiceId })
    const bookingWithCenterAndCourt = await Promise.all(
      listBooking.map(async (booking: any) => {
        const centerRepositoryInstance = new centerRepository()
        const center = await centerRepositoryInstance.getCenterById(booking.centerId)
        const courtRepositoryInstance = new courtRepository()
        const court = await courtRepositoryInstance.getCourt({ _id: booking.courtId })
        if (!center || !court) {
          return {
            ...booking._doc,
            centerName: 'Trung tâm không tồn tại',
            centerAddress: 'Trung tâm không tồn tại',
            courtNumber: 'Sân không tồn tại'
          }
        }
        return {
          ...booking._doc,
          centerName: center.centerName,
          centerAddress: center.location,
          courtNumber: court.courtNumber
        }
      })
    )
    return bookingWithCenterAndCourt
  }

  async completedBooking(bookingId: string) {
    const booking = await bookingRepository.getBookingbyId(bookingId)
    if (!booking) {
      throw new AppError('Booking not found', 404)
    }
    const currentTime = new Date()
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    const formattedHours = hours < 10 ? '0' + hours : hours
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes
    console.log(formattedMinutes, 'formattedMinutes')
    const formattedTime = `${formattedHours}:${formattedMinutes}`
    console.log('formattedTime', formattedTime)
    if (booking.start >= formattedTime || booking.end <= formattedTime) {
      throw new AppError('Không thể xác nhận booking trước giờ chơi', 400)
    }
    booking.status = 'completed'
    return bookingRepository.updateBooking({ _id: booking._id }, { status: booking.status })
  }

  async cancelledBooking(bookingId: string, userId: string) {
    const booking = await bookingRepository.getBooking({ _id: bookingId, userId: userId })
    if (!booking) {
      throw new AppError('Booking not found', 404)
    }

    const bookingStartDate = new Date(booking.date)
    const currentDate = new Date()
    const diffTime = bookingStartDate.getTime() - currentDate.getTime()
    const diffHours = diffTime / (1000 * 3600)

    // Nếu khoảng cách nhỏ hơn 24 giờ, không cho phép hủy
    if (diffHours < 24) {
      throw new AppError('Không thể hủy booking 1 ngày trước khi chơi', 400)
    }
    // Đặt giờ, phút, giây, và mili giây về 0 để chỉ so sánh ngày
    bookingStartDate.setHours(0, 0, 0, 0)
    currentDate.setHours(0, 0, 0, 0)

    // So sánh ngày hiện tại và ngày bắt đầu booking
    if (bookingStartDate.getTime() === currentDate.getTime()) {
      throw new AppError('Không thể hủy booking trong ngày', 400)
    }
    booking.status = 'cancelled'
    const slot = {
      courtId: booking.courtId.toString(),
      date: booking.date,
      start: booking.start,
      end: booking.start
    }
    const slotAvailable = []
    const timeSlotRepositoryInstance = new timeSlotRepository()
    while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${booking.end}:00`)) {
      const [hour, minute] = slot.start.split(':')
      if (minute === '00') {
        slot.end = `${hour}:30`
      } else {
        slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
      }
      slotAvailable.push({ ...slot })
      slot.start = slot.end
    }
    // Cập nhật trạng thái của các slot thành "booked"
    await Promise.all(
      slotAvailable.map(async (slot) => {
        await timeSlotRepositoryInstance.updateSlotStatus(slot, 'available')
      })
    )
    return bookingRepository.updateBooking({ _id: booking._id }, { status: booking.status })
  }

  async getConfirmedBookingByDay(dateFrom: string, dateTo: string, centerId: string) {
    const listBooking = []
    console.log('dateFrom', dateFrom)
    const startDate = new Date(`${dateFrom}`)
    const endDate = new Date(`${dateTo}`)

    console.log('startDate', startDate)
    if (startDate.getTime() === endDate.getTime()) {
      // Nếu dateFrom và dateTo giống nhau, chỉ gọi getListBooking một lần
      const formattedDate = startDate.toISOString().split('T')[0]
      console.log('formattedDate', formattedDate)
      const bookings = await bookingRepository.getListBooking({
        centerId: centerId,
        date: formattedDate,
        status: 'confirmed'
      })
      listBooking.push(...bookings)
    } else {
      const daysBetween = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const promises = []

      for (let i = 0; i <= daysBetween; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)

        const formattedDate = currentDate.toISOString().split('T')[0]

        console.log('formattedDate', formattedDate)

        // Tạo promise cho mỗi ngày và đẩy vào mảng promises
        promises.push(bookingRepository.getListBooking({ date: formattedDate, status: 'confirmed' }))
      }

      // Chờ tất cả các promise hoàn thành
      const bookingsArray = await Promise.all(promises)

      // Gộp tất cả các kết quả vào listBooking
      bookingsArray.forEach((bookings) => listBooking.push(...bookings))
    }
    return listBooking
  }

  async bookingDirectly(data: any) {
    const customerData = data.customerData
    const listBooking = data.listBooking
    console.log('customerData', customerData)
    console.log('listBooking', listBooking)
    const userRepositoryInstance = new userRepository()
    let user = await userRepositoryInstance.findUser({ userEmail: customerData.userEmail })
    if (!user) {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10)
      const newUser = await userRepositoryInstance.addUser({
        userName: customerData.userName,
        userEmail: customerData.userEmail,
        password: hashedPassword,
        userPhone: customerData.userPhone,
        role: 'customer'
      })
      user = newUser
      console.log('newUser', newUser)
      const mailOption = {
        subject: 'Welcome!',
        text: `Hello ${newUser.userName}, your password is ${generatedPassword}`,
        html: `<html><p><b>Hello ${newUser.userName}, your password is ${generatedPassword}</b> </p></html>`
      }
      await sendEmailSerVice.sendEmail(newUser.userEmail, mailOption)
    } else if (user.userPhone === null) {
      await userRepositoryInstance.updateUser(user._id.toString(), { userPhone: customerData.userPhone })
    }

    const allSlotsAvailable = await this.checkAllSlotsAvailability(listBooking)
    if (!allSlotsAvailable) {
      throw new AppError('Xin lỗi slot đã được đặt hoặc đang được đặt, kiểm tra lại booking', 400)
    }

    const orderId = 'BDR' + new Date().getTime()
    const InvoiceServiceInstance = new InvoiceService()
    let totalprice = 0
    const newInvoice = await InvoiceServiceInstance.addInvoiceBookingbyDay(totalprice, user._id.toString(), orderId)
    const timeSlotServiceInstance = new timeSlotService()
    const timeSlotRepositoryInstance = new timeSlotRepository()

    const listnewbooking = await Promise.all(
      listBooking.map(async (booking: any) => {
        booking.invoiceId = newInvoice._id
        booking.userId = user.id
        const PricePerBooking = await timeSlotServiceInstance.getPriceFormStartoEnd(
          booking.centerId,
          booking.start,
          booking.end
        )
        if (PricePerBooking) {
          booking.price = PricePerBooking
          totalprice += PricePerBooking
        }
        const newbooking = await bookingRepository.createBooking(booking)

        const slot = {
          courtId: newbooking.courtId.toString(),
          date: newbooking.date,
          start: newbooking.start,
          end: newbooking.start
        }
        const slotAvailable = []
        while (new Date(`1970-01-01T${slot.end}:00`) < new Date(`1970-01-01T${newbooking.end}:00`)) {
          const [hour, minute] = slot.start.split(':')
          if (minute === '00') {
            slot.end = `${hour}:30`
          } else {
            slot.end = `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
          }
          slotAvailable.push({ ...slot })
          slot.start = slot.end
        }
        // Cập nhật trạng thái của các slot thành "booked"
        await Promise.all(
          slotAvailable.map(async (slot) => {
            await timeSlotRepositoryInstance.updateSlotStatus(slot, 'booked')
          })
        )
        newbooking.status = 'confirmed'
        bookingRepository.updateBooking({ _id: newbooking._id }, newbooking)
        return newbooking
      })
    )
    const InvoiceRepositoryInstance = new InvoiceRepository()
    const updateInvoice = await InvoiceRepositoryInstance.updateInvoice(
      { _id: newInvoice._id },
      { price: totalprice, status: 'confirmed' }
    )
    return listnewbooking
  }
}
export default bookingService
