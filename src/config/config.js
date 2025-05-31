export const url = "http://localhost:5251"

//auth
export const login = "/api/v1/Auth/login"
export const forgotPassword = "/api/v1/Auth/forgot-password"
export const resetPassword = "/api/v1/Auth/reset-password"
export const changePassword = "/api/v1/Auth/change-password"
export const getUserById = "/api/v1/Auth/users/"
export const updateAccounts= "/api/v1/Auth/users"
export const getAllAccount = "/api/v1/Auth/users"

//approveSetting
export const createApprove = "/api/v1/khkd/approval-settings"
export const getApprove = "/api/v1/khkd/approval-settings"
export const getApproveByMoudle = "/api/v1/khkd/approval-settings/"

//task
export const getBoard = "/api/v1/boards"
export const createBoard = "/api/v1/boards"
export const deleteBoard = "/api/v1/boards/"
export const getCardInBoard = "/api/v1/cards/board/"
export const createCard ="/api/v1/cards"
export const deleteCard ="/api/v1/cards/"
export const moveCard = "/api/v1/cards/"

// assignmentSlip
export const createAssignment = "/api/v1/JobAssignment"
export const updateAssignment = "/api/v1/JobAssignment/"
export const getAssignById = "/api/v1/JobAssignment/"
export const deleteAssignment = "/api/v1/JobAssignment/"
export const filterAssignment = "/api/v1/JobAssignment/filter"
export const getAllAssignment = "/api/v1/JobAssignment"

//notes
export const getNote = "/api/v1/khkd/notes"
export const addNote = "/api/v1/khkd/notes"
export const deleteNote = "/api/v1/khkd/notes/"

//attechment
export const addAttachment = "/api/v1/khkd/attachments/upload"
export const getAttachment = "/api/v1/khkd/attachments"
export const downloadAttachment = "/api/v1/khkd/attachments/download/"
export const deleteAttachment = "/api/v1/khkd/attachments/"

//follower
export const addFollow = "/api/v1/khkd/followers/assign"
export const getFollow = "/api/v1/khkd/followers"

//plan
export const getPlan = "/api/v1/khdk/plan"
export const addPlan = "/api/v1/khdk/plan"
export const getPlanByID = "/api/v1/khdk/plan/"
export const updatePlan = "/api/v1/khdk/plan/"
export const deletePlan = "/api/v1/khdk/plan/"
export const filterPlan = "/api/v1/khdk/plan/filter"

//test run plan
export const getTestRunPlan = "/api/v1/khkd/test-run-plan"
export const addTestRunPlan = "/api/v1/khkd/test-run-plan"
export const getTestRunPlanByID = "/api/v1/khkd/test-run-plan/"
export const updateTestRunPlan = "/api/v1/khkd/test-run-plan/"
export const deleteTestRunPlan = "/api/v1/khkd/test-run-plan/"
export const filterTestRunPlan = "/api/v1/khkd/test-run-plan/filter"

//receiving report
export const getReceiving = "/api/v1/khkd/receiving-report"
export const addReceiving = "/api/v1/khkd/receiving-report"
export const getReceivingByID = "/api/v1/khkd/receiving-report/"
export const updateReceiving = "/api/v1/khkd/receiving-report/"
export const deleteReceiving = "/api/v1/khkd/receiving-report/"
export const filterReceiving = "/api/v1/khkd/receiving-report/filter"