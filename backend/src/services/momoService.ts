import crypto from 'crypto'
import axios from 'axios'
import AppError from '~/utils/appError'
class momoService {
  static async createPayment(
    orderInfo: string,
    amount: number,
    orderId: string, //BD 1235441
    centerId: string,
    callbackUrl: string,
    extraData: string,
    redirect: string
  ) {
    const accessKey = process.env.MOMO_ACCESS_TOKEN
    const secretKey = process.env.MOMO_SECRET_KEY
    const partnerCode = 'MOMO'
    const redirectUrl = process.env.MOMO_REDIRECT_URL + redirect
    const ipnUrl = process.env.MOMO_IPN_URL_HOSTING + callbackUrl
    console.log('ipnUrl', ipnUrl)
    const requestType = 'captureWallet'
    const requestId = orderId
    const orderGroupId = ''
    const autoCapture = true
    const orderExpireTime = 1
    const lang = 'vi'
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`
    const signature = crypto
      .createHmac('sha256', secretKey ?? '')
      .update(rawSignature)
      .digest('hex')

    const requestBody = JSON.stringify({
      partnerCode,
      partnerName: 'RacketRise',
      storeId: centerId,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      orderExpireTime,
      requestType,
      autoCapture,
      extraData,
      orderGroupId,
      signature
    })

    const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/create',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      },
      data: requestBody
    }

    try {
      // Gửi yêu cầu HTTP bằng Axios
      const result = await axios(options) // Nhật ký thêm để gỡ lỗi chi tiết
      return result.data
    } catch (error: any) {
      console.error('MoMo API Error:', error) // Nhật ký thêm để gỡ lỗi chi tiết
      return error.response ? error.response.data : error.message
    }
  }
  static generateSignature(secretKey: any, data: any) {
    return crypto.createHmac('sha256', secretKey).update(data).digest('hex')
  }

  static async checkWalletStatus(walletId: any, walletName: any) {
    const accessKey = process.env.MOMO_ACCESS_TOKEN
    const secretKey = process.env.MOMO_SECRET_KEY
    const partnerCode = 'MOMO'
    const requestId = Date.now().toString()
    const requestType = 'checkWallet'
    const lang = 'vi'

    const disbursementMethod = {
      walletId,
      walletName
    }

    const rawSignature = `accessKey=${accessKey}&disbursementMethod=${JSON.stringify(disbursementMethod)}&orderId=${requestId}&partnerCode=${partnerCode}&requestId=${requestId}&requestType=${requestType}`
    const signature = this.generateSignature(secretKey, rawSignature)

    const requestBody = JSON.stringify({
      partnerCode,
      orderId: requestId,
      lang,
      requestId,
      requestType,
      disbursementMethod: JSON.stringify(disbursementMethod),
      signature
    })

    const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/disbursement/verify',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      },
      data: requestBody
    }

    try {
      const result = await axios(options)
      return result.data
    } catch (error: any) {
      return new AppError(error.response ? error.response.data : error.message, 500)
    }
  }

  static async getCurrentMerchantBalance(orderId: any) {
    const accessKey = process.env.MOMO_ACCESS_TOKEN
    const secretKey = process.env.MOMO_SECRET_KEY
    const partnerCode = 'MOMO'
    const requestId = Date.now().toString()
    const lang = 'vi'

    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`
    const signature = this.generateSignature(secretKey, rawSignature)

    const requestBody = JSON.stringify({
      partnerCode,
      orderId,
      lang,
      requestId,
      signature
    })

    const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/disbursement/balance',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      },
      data: requestBody
    }

    try {
      const result = await axios(options)
      return result.data
    } catch (error: any) {
      return new AppError(error.response ? error.response.data : error.message, 500)
    }
  }

  static async createDisbursement(
    walletId: any,
    walletName: any,
    amount: any,
    orderId: any,
    callbackUrl: any,
    extraData = ''
  ) {
    const accessKey = process.env.MOMO_ACCESS_TOKEN
    const secretKey = process.env.MOMO_SECRET_KEY
    const partnerCode = 'MOMO'
    const requestId = Date.now().toString()
    const requestType = 'disburseToWallet'
    const lang = 'vi'

    const disbursementMethod = {
      walletId,
      walletName
    }

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&disbursementMethod=${JSON.stringify(disbursementMethod)}&extraData=${extraData}&orderId=${orderId}&orderInfo=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}&requestType=${requestType}`
    const signature = this.generateSignature(secretKey, rawSignature)

    const requestBody = JSON.stringify({
      partnerCode,
      requestId,
      amount,
      orderId,
      orderInfo: orderId,
      lang,
      requestType,
      ipnUrl: callbackUrl,
      extraData,
      disbursementMethod: JSON.stringify(disbursementMethod),
      signature
    })

    const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/disbursement/pay',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      },
      data: requestBody
    }

    try {
      const result = await axios(options)
      return result.data
    } catch (error: any) {
      return new AppError(error.response ? error.response.data : error.message, 500)
    }
  }
}
export default momoService
