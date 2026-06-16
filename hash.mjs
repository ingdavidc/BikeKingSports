import { hash } from 'bcrypt-ts';

async function generate() {
    const password = 'admin'; // Default password
    const hashed = await hash(password, 10);
    console.log(hashed);
}

generate();
