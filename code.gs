function autoDraft(e) {
  
    // Get mail quota 
    var emailQuotaRemaining = MailApp.getRemainingDailyQuota();
    Logger.log("Remaining email quota: " + emailQuotaRemaining);
  
    // This will be used to send you a email notification in case of error on form
    // for example if someone entered a wrong email address.
    var myemail = Session.getActiveUser().getEmail();
    
    //Leave this field blank - it will be auto populated from "Email" field in 
    // your contact form. Make sure you have a "Email" Field in your contact form.
    var email = "";
    
    // This is going to be the subject of reply email
    // You can change it as per your requirements
    var userName = e.namedValues["Nickname"];
    var subject = "Re: " + userName + "!"+" Registering for the Amarantos PLRT Program";

    // The variable e holds all the form values in an array.
    // Loop through the array and append values to the body.
    
    var htmlBody = HtmlService.createHtmlOutputFromFile('mail_template').getContent();
    var htmlName = '<div style="font-size:large"><font size="4"><span style="font-family:garamond,serif"><font color="#274e13">'+"Dear "+userName+","+"</font></span>";
    var message = htmlName+"\n"+htmlBody;
    
    
    var columns, mysheet;
  
    try {
        mysheet = SpreadsheetApp.getActiveSheet();
        var lastRow = mysheet.getLastRow();
        
        //Update the Status of new submission as New
        mysheet.getRange(lastRow, getColIndexByName("Status")).setValue("Drafted");
        SpreadsheetApp.flush();

        columns = mysheet.getRange(1, 1, 1, mysheet.getLastColumn()).getValues()[0];
        if (e) {
            // This is the submitter's email address
            var em = e.namedValues["Email Address"];
            if(em) {
              email = em.toString();
            } else {
              throw {'message':'Your email address? Field is required. Please add a field called Email in your sheet.'}
            }
            
            // you had applied notification
            message += "------------------<br/> You had applied for this program with the following details On <br/>"
            
            // Only include form values that are not blank
            for (var keys in columns) {
                var key = columns[keys];
                if (e.namedValues[key]) {
                    message += key + ' :: ' + e.namedValues[key] + "<br/>";
                }
            }
         
         
           GmailApp.createDraft(email, subject, htmlName, {
             htmlBody: message          
           });
          
          Logger.log("Message Drafted");
        } else {
            var err = 'Required Input params are passed only during live form submission. Please try the script by submitting the live form.';
            Logger.log(err);
            throw {
                'message': err
            };
        }

    } catch (e) {
      MailApp.sendEmail(myemail, "Ack: Error in Auto replying to contact form submission. No reply was sent.", e.message + ' \n\ncolumns: ' + columns + ' \n\nmessage: ' + message);
    }
}


function getColIndexByName(colName) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var numColumns = sheet.getLastColumn();
  var row = sheet.getRange(1, 1, 1, numColumns).getValues();
  for (i in row[0]) {
    var name = row[0][i];
    if (name == colName) {
      return parseInt(i) + 1;
    }
  }
  return -1;
}