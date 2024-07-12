async function signupPage (event) {
    event.preventDefault();
    const signupDetails = {
        username:event.target.username.value,
        email:event.target.email.value,
        number:event.target.number.value,
        password:event.target.password.value,
    }; 
    console.log(signupDetails)
    try{
        const response = await axios.post('/user/signup', signupDetails);
        alert('Succesfully signed');
        window.location.href = '../login/login.html';
    }catch(error){
        console.error('Error signing up:', error);
        alert('Signup failed. Please check your details and try again.');
    }
}