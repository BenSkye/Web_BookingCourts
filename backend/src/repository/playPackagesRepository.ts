import PlayPackage from '~/models/playPackagesModel';
import PlayHour from '~/models/playHoursModel';
import Center from '~/models/centerModel'; // Adjust the path as necessary
import Price from '~/models/priceModel'; // Adjust the path as necessary
import User from '../models/userModel'

interface IPlayPackageRepository {
  addPlayPackage(playPackage: any): Promise<any>;
  addPlayHour(playPackage: any): Promise<any>;
  updatePlayPackage(playPackage: any): Promise<any>;
  findPlayPackageByUserIdAndCenterId(userId: any, centerId: any): Promise<any>;


}

class PlayPackageRepository implements IPlayPackageRepository {
  async addPlayPackage(playPackage: any) {
    const newPlayPackage = new PlayPackage(playPackage);
    return await newPlayPackage.save();
  }

  async addPlayHour(playPackage: any) {
    const newPlayHour = new PlayHour(playPackage);
    return await newPlayHour.save();
  }

  public async findPlayPackageByUserIdAndCenterId(userId: any, centerId: any) {
    return await PlayPackage.findOne({ userId, centerId });
  }

  public async updatePlayPackage(playPackage: any) {
    return await PlayPackage.findByIdAndUpdate(playPackage._id, playPackage, { new: true });
  }

  async getPlayPackage(query: any) {
    return await PlayPackage.findOne(query);
  }

}

export default PlayPackageRepository;
