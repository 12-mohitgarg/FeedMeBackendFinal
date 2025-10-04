const DEPARTMENT_STATUS = {
    Active : 1,
    Not_Active : 0
}
const CALL_CENTER_MISSION = {
    Active : 1,
    Not_Active : 0    
}
const CALL_CENTER_STATUS = {
    Active : "Active",
    Not_Active : 'Inactive'    
}
const EXAM_CATEGORY_STATUS = {
    Active : 1,
    Not_Active : 0
}
const QUESTION_STATUS = {
    Active : 1,
    Not_Active : 0
}
const ANSWER_STATUS = {
    Correct : 1,
    Incorrect : 0
}
const IS_ACCEPT = {
    Accept : 1,
    Not_Accept : 0
}

// Not used
const OTP_VERIFY = {
    Verify : 1,
    Not_Verify : 0
}
const USER_STATUS = {
    Active : 1,
    Not_Active : 0
}

const SPECIALIZATION_STATUS = {
    Active : 1,
    Not_Active : 0
}

const LANGUAGE = {
    Active : 1,
    Not_Active : 0
}
const CONSULTATION_FEES = {
    Active : 1,
    Not_Active : 0
}
const IS_SETUP_PROFILE = {
    Profile : 1,
    Document : 2,
    Not_Active : 0,
}

const SCREEN_NAME = {
    Cattle_screen     : "cattle_screen",
    Insurance_Screen  : "insurance_screen",
    Pan_screen        :  "pan_screen",
    Aadhar_screen     :  "aadhar_screen",
    Bank_screen       :  "bank_screen",
    Signature_screen  :  "signature_screen",
    Certifiate_screen :  "certifiate_screen",
    Health_screen     :  "Health_sreen",
    Government_screen :  "Government_screen"
 
}


const API = {
    STATUS               :  "KYCFI"  //KYCFI,KARZA
}


const EDUCATION_DATA = [
    { key: '1', value: 'Below Secondary (10 th)' },
    { key: '2', value: 'Secondary (10th Pass)' },
    { key: '3', value: 'Senior Secondary (12th Pass)' },
    { key: '4', value: 'Graduate or Equivalent' },
    { key: '5', value: 'Post Graduate and Above (Or Equivalent)' }
];


module.exports = {
    OTP_VERIFY,
    USER_STATUS,
    SPECIALIZATION_STATUS,
    LANGUAGE,
    CONSULTATION_FEES,
    IS_SETUP_PROFILE,
    DEPARTMENT_STATUS,
    EXAM_CATEGORY_STATUS,
    QUESTION_STATUS,
    ANSWER_STATUS,
    IS_ACCEPT,
    EDUCATION_DATA,
    SCREEN_NAME,
    API,
    CALL_CENTER_MISSION,
    CALL_CENTER_STATUS
}