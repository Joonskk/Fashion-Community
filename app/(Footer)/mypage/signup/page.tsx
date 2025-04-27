const SignUp = () => {
    return (
      <div className="p-20">
        <h4>정보 입력</h4>
        <form
          action="/api/post/edit-profile"
          method="POST"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <input name="name" placeholder="이름"></input>
          <input name="height" placeholder="키(cm)"></input>
          <input name="weight" placeholder="몸무게(kg)"></input>
          <button type="submit">제출</button>
        </form>
      </div>
    )
  }

  export default SignUp;