const bcrypt = require('bcryptjs');

const password = 'topconadmin'; // This is the password you want to hash

bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Hashed Password:', hashedPassword);
});
