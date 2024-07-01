import tournamentRepository from '~/repository/tournamentRepository'

interface ItournamentService {
  addTournament(data: any, userId: string): Promise<any>
  getTournamentById(id: string): Promise<any>
}

class tournamentService implements ItournamentService {
  async addTournament(data: any, userId: string) {
    console.log('data', data)
    const tournament = { ...data, userId: userId, status: 'pending' }
    const tournamentRepositoryInstance = new tournamentRepository()
    const newTournament = await tournamentRepositoryInstance.addTournament(tournament)
    return newTournament
  }
  async getTournamentById(id: string) {
    const tournamentRepositoryInstance = new tournamentRepository()
    const tournament = await tournamentRepositoryInstance.getTournament({ _id: id })
    return tournament
  }
}
export default tournamentService
