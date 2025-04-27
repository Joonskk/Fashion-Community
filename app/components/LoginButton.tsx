'use client'

import { signIn } from 'next-auth/react'

const LoginButton = () => {
  return (
    <button
      type="button"
      className="google__btn"
      onClick={() => signIn('google',{
        callbackUrl: '/mypage'
      })}
    >
      <i className="fa fa-google"></i>
      Sign in with Google
    </button>
  )
}

export default LoginButton
