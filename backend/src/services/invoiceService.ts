import InvoiceRepository from '~/repository/invoiceReposotory'
import bookingService from './bookingService'
import centerService from './centerService'
import centerRepository from '~/repository/centerRepository'
import bookingRepository from '~/repository/bookingRepository'

interface IinvoiceService {
  addInvoiceBookingbyDay(price: any, userid: string, orderId: string): Promise<any>

  addInvoiceUpdateBookingbyDay(price: any, userid: string, orderId: string): Promise<any>
  paidInvoice(invoiceId: string): Promise<any>
  getInvoicesByUserId(userid: string): Promise<any>
  getListInvoices(query: any): Promise<any>
  getInvoice(query: any): Promise<any | null>
  getInvoicesByInvoiceID(invoiceID: string): Promise<any | null>
  deleteInvoiceById(id: string): Promise<any>
}
class InvoiceService implements IinvoiceService {
  async addInvoiceBookingbyDay(price: any, userid: string, orderId: string) {
    const InvoiceRepositoryInstance = new InvoiceRepository()
    const newInvoice = {
      invoiceID: orderId,
      price: price,
      userId: userid,
      status: 'pending',
      invoiceFor: 'BBD'
    }
    return InvoiceRepositoryInstance.addInvoice(newInvoice)
  }
  async addInvoiceUpdateBookingbyDay(price: any, userid: string, orderId: string) {
    const InvoiceRepositoryInstance = new InvoiceRepository()
    const newInvoice = {
      invoiceID: orderId,
      price: price,
      userId: userid,
      status: 'pending',
      invoiceFor: 'UBBD'
    }
    return InvoiceRepositoryInstance.addInvoice(newInvoice)
  }
  async paidInvoice(invoiceID: string) {
    const InvoiceRepositoryInstance = new InvoiceRepository()
    return InvoiceRepositoryInstance.updateInvoice({ invoiceID: invoiceID }, { status: 'paid' })
  }
  async getInvoicesByInvoiceID(invoiceID: string): Promise<any> {
    const InvoiceRepositoryInstance = new InvoiceRepository()
    const invoice = InvoiceRepositoryInstance.getInvoice({ invoiceID: invoiceID })
    return invoice
  }
  async deleteInvoiceById(id: string): Promise<any> {
    const InvoiceRepositoryInstance = new InvoiceRepository()
    return InvoiceRepositoryInstance.deleteInvoice({ _id: id })
  }
  async getInvoicesByUserId(userid: string): Promise<any> {
    const InvoiceRepositoryInstance = new InvoiceRepository()
    const ListInvoice = await InvoiceRepositoryInstance.getListInvoices({ userId: userid })
    const updatedInvoices = await Promise.all(
      ListInvoice.map(async (invoice: any) => {
        if (invoice.invoiceFor === 'BBD' || invoice.invoiceFor === 'UBBD') {
          const booking = await bookingRepository.getBooking({ invoiceId: invoice._id })
          const centerRepositoryInstance = new centerRepository()
          if (!booking) return invoice
          const center = await centerRepositoryInstance.getCenterById({ _id: booking.centerId })
          return { ...invoice.toObject(), center }
        }
        return invoice
      })
    )
    updatedInvoices.sort((a: any, b: any) => {
      const dateA = new Date(a.updatedAt)
      const dateB = new Date(b.updatedAt)
      return dateB.getTime() - dateA.getTime() // Sort in descending order
    })
    return updatedInvoices
  }
  getListInvoices(query: any): Promise<any> {
    throw new Error('Method not implemented.')
  }
  getInvoice(query: any): Promise<any> {
    throw new Error('Method not implemented.')
  }
}
export default InvoiceService
