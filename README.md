
# Ingram Micro SDK JS

This project is an Express.js application that integrates with the Ingram Micro SDK for resellers. It provides various API endpoints to interact with Ingram Micro's services.

## Project Structure

```
.env
.gitignore
.mocharc.js
app.js
bin/
    www
package.json
public/
    images/
    javascripts/
    stylesheets/
        style.css
routes/
    api.js
    index.js
    token.json
    users.js
test/
    api.test.js
    app.test.js
views/
    error.ejs
    index.ejs
```

## Installation

1. Clone the repository:
   git clone https://github.com/yourusername/ingram-micro-sdk-js.git

2. Navigate to the project directory:
   cd ingram-micro-sdk-js

3. Install the dependencies:
   npm install

4. Create a .env file in the root directory and add your environment variables:  
```text  
   CLIENT_ID='your_client_id'
   CLIENT_SECRET='your_client_secret'
   AUTH_URL="https://api.ingrammicro.com/oauth/oauth20/token"
   IM_CUSTOMER_NUMBER=your_customer_number
   IM_SENDERID="your_sender_id"
   URL_BASE="https://api.ingrammicro.com/"
   DEV=True
   IM_COUNTRY_CODE="your_country_code"
```

## Usage

1. Start the application:
   npm start

2. The application will be available at `http://localhost:3000`.

## Running Tests - Not Working

To run the tests, use the following command:
   npx mocha

