
const Register = () => {

     const handleSubmit = (e) => {
       e.preventDefault();
       // Handle register logic here
     }; 

     
  return (

   
    <main>
      <div className="form-container">
        <h1>Register</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
            />
          </div>
          <button className="button primary-button" type="submit">
            Register
          </button>
        </form>
      </div>
    </main>
  );
}

export default Register