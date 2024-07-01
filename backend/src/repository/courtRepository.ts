import Court from '~/models/courtModel'
interface ICourtRepository {
  addCourt(court: any): Promise<any>
  getListCourt(query: any): Promise<any>
  getCourt(query: any): Promise<any>
  getListCourtId(query: any): Promise<any>
}
class courtRepository implements ICourtRepository {
  async addCourt(court: any) {
    const newCourt = new Court(court)
    return newCourt.save()
  }
  async getListCourt(query: any) {
    return await Court.find(query)
  }
  async getCourt(query: any) {
    return await Court.findOne(query)
  }

  async getListCourtId(query: any) {
    return await Court.find(query).select('_id')
  }
  static async getAllCourt() {
    return await Court.find().exec()
  }
}
export default courtRepository
