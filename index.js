const express = require('express');
const app = express();
const dfff = require('dialogflow-fulfillment');
const nodemailer = require("nodemailer");
var admin = require("firebase-admin");

var serviceAccount = require("./config/project-firebase-70320-firebase-adminsdk-5xlst-7efdcd82af.json");
const { text } = require('express');
const { SignIn } = require('actions-on-google');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-firebase-70320-default-rtdb.firebaseio.com"
});


app.get('/', (req, res)=>{
    res.send("We are liveaa")
});

app.post('/', express.json(), (req, res)=>{
    const agent = new dfff.WebhookClient({
        request : req,
         response : res
    });
    console.log(JSON.stringify(req.body));

    const result = req.body.queryResult;

    


     function userOnboardingHandler(agent) {


    

       
       const { mail } = result.parameters;
       agent.add(`I sent you an email at the address ${mail} you provided!`);

       var db = admin.database();
     
       var items;

        admin.auth().getUserByEmail(mail)
       .then(function(userRecord) {
         // See the UserRecord reference doc for the contents of userRecord.
         console.log('Successfully fetched user data:', userRecord.uid);


       

          admin.database().ref("/orders").orderByChild('userId').equalTo(userRecord.uid).on("child_added", function(snapshot) {
            items=snapshot.val().items;
            var text="";
            for(i=0 ; i<items.length; i++){
              //console.log(items[i].title+"\n")
              text=(text+(items[i].title+" <br/>"));
            }
            console.log("\n\ntext:"+text);
            const output = `
            <p>This are the items you purchased</p>
            
            <h3>${text}</h3>
           
          `;

            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                  user: 'marcian.bondoc@gmail.com',
                  pass: 'Marcianpetrut1!'
              }
          });
          
          const mailOptions = {
              from: "marcian.bondoc@gmail.com", // sender address
              to: mail , // list of receivers
              subject: "BotOrdersMessage", // Subject line
              html: output
          };
          
          transporter.sendMail(mailOptions, function (err, info) {
              if(err)
              {
                console.log(err);
              }
          });
       
          });
         
       })
       .catch(function(error) {
        agent.add("The address you provided is not registered in the database!\n")
       });
       
                             
     
      }                                
    
   
    var intentMap = new Map();
  

    intentMap.set('UserOnBoarding',userOnboardingHandler )
    

    agent.handleRequest(intentMap);

});

app.listen(3333, ()=>console.log("Server is live at port 3333"));
