async function saveUser(user) {
    try {
        // Connect to the database
        const db = await connectToDatabase();

        // Insert the user data into the database
        const query = `
            INSERT INTO users (username, email, phone, password)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        const values = [user.attenixUsername, user.workEmail, user.phoneNumber, user.attenixPassword];
        const result = await db.query(query, values);

        // Return the inserted user's ID
        return result.rows[0].id;
    } catch (error) {
        // Handle any errors that occur during the database operation
        console.error('Error saving user:', error);
        throw error;
    }
}