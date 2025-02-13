# Natour

A full-stack sample web application based on Node.js, Express.js & MongoDb, 
 also PUG is used in frontend.


## How to run the project on your system
1) Provide all below environmental variables based on your personal data:

#### Variables related to connect MongoDb Database
- MONGODB_URI
- MONGODB_PASSWORD

#### Variables related to JWT 
- JWT_SECRET
- JWT_EXPIRE_IN
- JWT_COOKIE_EXPIRES_IN
#### Variables related to use an Gmail account to send Emails to clients:
- GMAIL_USERNAME
- GMAIL_PASSWORD
- GMAIL_HOST
- GMAIL_PORT
- EMAIL_FROM
#### Variables related to use STRIPE for payment processing:
- STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY

Please be noted variables' name are optional, and you can name them whatever you want, but be sure you use same names inside your project too.

2) Use below command in terminal to run project in DEVELOPMENT Environment

```bash
npm run dev
```

3) Use below command in terminal to run project in PRODUCTION Environment
```bash
node server.js
```
or
```bash
npm start
```



## Deployment
You can find a **live** example of website in below link:

[click to find out ](https://natour-ventuno.onrender.com/) 
