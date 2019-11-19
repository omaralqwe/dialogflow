/**
* REST Service class to handle dialogflow requests related to account (no person accounts). 
*
* @author  Omar Al Qweider
* @version 0.1
* @since   2019-11-11
*  
*/

// to add a check if person account is enabled in the organization so that we can handle both scenario with and without Person Account

// add few methods to handle simple get and get with name etc depending on attributes
@RestResource(urlMapping='/Account/Request/GET/*')
global with sharing class GETAccountRequestHandler {
    
    /**
    * This is the method using on "GET" requests. 
    * @input Json payload that includes attributes used in the SOQL query to filter and limit accounts to search
    * 
    * @return List<Account>
    */
    @HttpPost
    global static List<Account> show() {
        RestRequest req = RestContext.request;
        List <Account> accountList = new List<Account>();
        Map<String, Object> jsonMap = (Map<String, Object>)System.JSON.deserializeUntyped(req.requestBody.toString());
        System.debug('Json Request '+ jsonMap);

        try {
            //get metadata configuration for DialogFlow app
            DialogFlow_Config__mdt dialogFlowConfig = new DialogFlow_Config__mdt();
            if (Schema.sObjectType.DialogFlow_Config__mdt.isQueryable()==true){
                dialogFlowConfig = [SELECT id, Query_Limit__c FROM DialogFlow_Config__mdt Limit 1];
            }
            System.debug('dialog flow configuration is ' + dialogFlowConfig);
            //extract attributes from request
            String accountName = (String)jsonMap.get('Name');
            Integer lmt = dialogFlowConfig.Query_Limit__c.intValue();

            //get Account attributes from metadata
            //Account_Field__mdt

            System.debug('limit set to ' +lmt);
            
            Date createdDateFrom = (Date)jsonMap.get('FromDate');

            //if the Account object can be queried by the user
            if (Schema.sObjectType.Account.isQueryable()==true){
                System.debug('account name ' + accountName + ' and limit ' + lmt);
                if (String.IsNotBlank(accountName)){
                    accountList = [SELECT Id, Name, CreatedDate FROM Account WHERE Name = :accountName Limit :lmt];
                }
                if (String.IsBlank(accountName)){
                    if (createdDateFrom !=null){
                        accountList = [SELECT Id, Name, CreatedDate FROM Account WHERE CreatedDate > :createdDateFrom Order By CreatedDate desc Limit :lmt];
                    }
                    else {
                        accountList = [SELECT Id, Name, CreatedDate FROM Account Order By CreatedDate desc Limit :lmt];
                    }
                }
            }
            return accountList;
        }
        catch (DMLException e) {
            throw new DMLException ('Exception '  + e.getMessage() + ' , for the request ' + jsonMap);
        }
	}
    
    /**
    * Check to see if person accounts are enabled.
    * @return Boolean 
    */
     
    public Boolean personAccountsEnabled()
    {
        // Describe the Account object to get a map of all fields
        // then check to see if the map contains the field 'isPersonAccount'
        return Schema.sObjectType.Account.fields.getMap().containsKey( 'isPersonAccount' );
    }
}
