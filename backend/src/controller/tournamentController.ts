import tournamentService from '~/services/tournamentService'
import catchAsync from '~/utils/catchAsync'

class tournamentController {
  static createTournament = catchAsync(async (req: any, res: any, next: any) => {
    const tournamentServiceInstance = new tournamentService()
    console.log('req.body', req.body)
    const newTournament = await tournamentServiceInstance.addTournament(req.body, req.user._id)
    res.status(201).json({
      status: 'success',
      data: {
        tournament: newTournament
      }
    })
  })
  static getTournamentById = catchAsync(async (req: any, res: any, next: any) => {
    const tournamentServiceInstance = new tournamentService()
    const tournament = await tournamentServiceInstance.getTournamentById(req.params.id)
    res.status(200).json({
      status: 'success',
      data: {
        tournament
      }
    })
  })
}
export default tournamentController
