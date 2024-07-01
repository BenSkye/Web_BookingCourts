import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import userRepository from '~/repository/userRepository'
import bcryptjs from 'bcryptjs'
import AppError from '~/utils/appError'
import { IUser } from '~/repository/userRepository'
import sendEmailSerVice from './sendEmailService'

interface IAuthService {
  registerUser(user: IUser): Promise<any>
  registerPartner(user: IUser): Promise<any>
  loginUser(userEmail: string, password: string): Promise<{ user: Omit<any, 'password'>; token: string }>
  protect(token: string): Promise<any>
  googleLogin(
    userEmail: string,
    userName: string,
    avatar: string
  ): Promise<{ user: Omit<any, 'password'>; token: string }>
  changePassword(
    userId: string,
    passwordCurrent: string,
    newPassword: string
  ): Promise<{ userNewPass: Omit<any, 'password'>; token: string }>
}

class AuthService implements IAuthService {
  async registerUser(user: IUser) {
    const password = bcrypt.hashSync(user.password, 12)
    user.password = password
    const userRepositoryInstance = new userRepository()
    const newUser = await userRepositoryInstance.addUser(user)

    // Gửi email chào mừng với mật khẩu
    // await this.sendWelcomeEmail(newUser.userEmail, newUser.userName, user.password);

    return newUser
  }

  async registerPartner(user: any) {
    const password = bcrypt.hashSync(user.password, 12)
    user.password = password
    const userRepositoryInstance = new userRepository()
    const newUser = await userRepositoryInstance.addPartner(user)

    // Gửi email chào mừng với mật khẩu
    // await this.sendWelcomeEmail(newUser.userEmail, newUser.userName, user.password);

    return newUser
  }

  async loginUser(userEmail: string, password: string) {
    const userRepositoryInstance = new userRepository()
    const foundUser = await userRepositoryInstance.findUser({ userEmail })

    if (!foundUser) {
      throw new AppError('Email không tồn tại', 401)
    }

    const isMatch = bcrypt.compareSync(password, foundUser.password)
    if (!isMatch) {
      throw new AppError('Mật khẩu không đúng', 401)
    }

    const token = jwt.sign(
      {
        id: foundUser._id,
        role: foundUser.role
      },
      process.env.JWT_SECRET ?? ''
    )

    const { password: userPassword, ...user } = foundUser.toObject()
    return { user, token }
  }

  async protect(token: string) {
    const userRepositoryInstance = new userRepository()
    // if (!token) {
    //   throw new AppError('bạn chưa đăng nhập', 401)
    // }
    const decoded: jwt.JwtPayload = jwt.verify(token, process.env.JWT_SECRET ?? '') as jwt.JwtPayload
    const currentUser = await userRepositoryInstance.findUser({ _id: decoded.id })
    if (!currentUser) {
      throw new AppError('Người dùng không tồn tại', 401)
    }
    const ifChangePass = await userRepositoryInstance.changePasswordAfter(decoded.iat ?? 0, currentUser._id.toString())
    if (ifChangePass) {
      throw new AppError('Người dùng đã đổi mật khẩu', 401)
    }
    return currentUser
  }

  async googleLogin(userEmail: string, userName: string, avatar: string) {
    const userRepositoryInstance = new userRepository()
    const user = await userRepositoryInstance.findByEmail(userEmail)

    if (user !== null) {
      console.log('user', user)
      const token = jwt.sign(
        { id: user._id, role: user.role, avatar: user.avatar, userName: user.userName },
        process.env.JWT_SECRET ?? ''
      )
      const { password, ...rest } = user.toObject()
      return { user: rest, token }
    } else {
      console.log('user', user)
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10)
      const username = userName.split(' ').join('').toLowerCase() + Math.random().toString(36).slice(-8)
      const newUser = await userRepositoryInstance.addUser({
        userName,
        userEmail,
        password: hashedPassword,
        avatar: avatar
      })

      const token = jwt.sign(
        {
          id: newUser._id,
          role: newUser.role,
          avatar: newUser.avatar,
          userName: newUser.userName,
          userEmail: newUser.userEmail
        },
        process.env.JWT_SECRET ?? ''
      )

      // Gửi email chào mừng với mật khẩu chỉ khi người dùng mới được tạo
      console.log('newUser', newUser)
      const mailOption = {
        subject: 'Welcome!',
        text: `Hello ${newUser.userName}, your password is ${generatedPassword}`,
        html: `<html><p><b>Hello ${newUser.userName}, your password is ${generatedPassword}</b> </p></html>`
      }
      await sendEmailSerVice.sendEmail(newUser.userEmail, mailOption)

      const { password: hashedPassword2, ...rest } = newUser.toObject()
      return { user: rest, token }
    }
  }

  async changePassword(userId: string, passwordCurrent: string, newPassword: string) {
    const userRepositoryInstance = new userRepository()
    const user = await userRepositoryInstance.findUser({ _id: userId })

    if (!user) {
      throw new AppError('Người dùng không tồn tại', 401)
    }

    const truePassword = await bcrypt.compare(passwordCurrent, user.password)

    if (!truePassword) {
      throw new AppError('Mật khẩu hiện tại không đúng', 401)
    }

    user.password = bcrypt.hashSync(newPassword, 12)
    const userNewPass = await userRepositoryInstance.updatePassword(userId, user.password)

    if (!userNewPass) {
      throw new AppError('Lỗi khi cập nhật mật khẩu', 401)
    }

    const token = jwt.sign({ id: userNewPass._id, role: userNewPass.role }, process.env.JWT_SECRET ?? '')
    const { password: userPassword, ...newuser } = userNewPass.toObject()
    return { userNewPass, token }
  }
}

export default AuthService
