document.getElementById('loginForm').addEventListener('submit', loginSubmit);
async function loginSubmit (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try{
        const response = await axios.post(` http://localhost:3000/user/login`, { email, password });
        localStorage.setItem('token',response.data.token);
        alert('Login successfull');
        window.location.href = '../chats/chat-app.html';
    }catch (error) {
        console.error('Error logging in:', error);
        alert('Login failed. Please check your credentials and try again.');
    }
}