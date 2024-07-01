import { Router } from 'express'
import authController from '~/controller/authController'
import tournamentController from '~/controller/tournamentController'
const tournamenRoute = Router()

tournamenRoute
  .route('/create-tournament')
  .post(authController.protect, authController.restricTO('customer'), tournamentController.createTournament)
tournamenRoute.route('/:id').get(tournamentController.getTournamentById)
export default tournamenRoute
