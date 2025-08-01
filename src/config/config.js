export const url = "https://44a5b09b897a.ngrok-free.app"

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
export const exportExcelAssignment = "/api/v1/JobAssignment/export-excel/"
export const exportPDFAssignment = "/api/v1/JobAssignment/export-excel/"

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
export const exportExcelPlan = "/api/v1/khdk/plan/export-excel/"

//test run plan
export const getTestRunPlan = "/api/v1/khkd/test-run-plan"
export const addTestRunPlan = "/api/v1/khkd/test-run-plan"
export const getTestRunPlanByID = "/api/v1/khkd/test-run-plan/"
export const updateTestRunPlan = "/api/v1/khkd/test-run-plan/"
export const deleteTestRunPlan = "/api/v1/khkd/test-run-plan/"
export const filterTestRunPlan = "/api/v1/khkd/test-run-plan/filter"
export const exportExcelTestRunPlan = "/api/v1/khkd/test-run-plan/export-excel/"

//receiving report
export const getReceiving = "/api/v1/khkd/receiving-report"
export const addReceiving = "/api/v1/khkd/receiving-report"
export const getReceivingByID = "/api/v1/khkd/receiving-report/"
export const updateReceiving = "/api/v1/khkd/receiving-report/"
export const deleteReceiving = "/api/v1/khkd/receiving-report/"
export const filterReceiving = "/api/v1/khkd/receiving-report/filter"
export const exportExcelReceiving = "/api/v1/khkd/receiving-report/export-excel/"

//auto numbering
export const getNumbering = "/api/DocumentNumber/generate?prefix="

//approvals
export const addApproval = "/api/Approvals"
export const updateStatusApproval = "/api/Approvals"
export const getApprovalByUser = "/api/Approvals/my"
export const getApprovalByRef = "/api/Approvals/by-ref"
export const changeUserApproval = "/api/Approvals/change-user"
export const filterApproval = "/api/Approvals/filter"

//warehousePC
export const getWareHouse = "/api/v1/WareHouse"
export const addWareHouse = "/api/v1/WareHouse"
export const getWareHouseByID = "/api/v1/WareHouse/"
export const updateWareHouse = "/api/v1/WareHouse/"
export const deleteWareHouse = "/api/v1/WareHouse/"
export const filterWareHouse = "/api/v1/WareHouse/filter"

//EquipmentInventory
export const getEquipmentInventory = "/api/v1/EquipmentInventory"
export const addEquipmentInventory = "/api/v1/EquipmentInventory"
export const getEquipmentInventoryById = "/api/v1/EquipmentInventory/"
export const updateEquipmentInventoryId = "/api/v1/EquipmentInventory/"
export const deleteEquipmentInventory = "/api/v1/EquipmentInventory/"
export const filterEquipmentInventory = "/api/v1/EquipmentInventory/filter"

//repair
export const getAssetRepair = "/api/v1/AssetRepair"
export const addAssetRepair = "/api/v1/AssetRepair"
export const getAssetRepairByID = "/api/v1/AssetRepair/"
export const updateAssetRepair = "/api/v1/AssetRepair/"
export const deleteAssetRepair = "/api/v1/AssetRepair/"
export const filterAssetRepair = "/api/v1/AssetRepair/filter"

//BuySupplies
export const getPurchaseProposal = "/api/v1/PurchaseProposal"
export const addPurchaseProposal = "/api/v1/PurchaseProposal"
export const getPurchaseProposalByID = "/api/v1/PurchaseProposal/"
export const updatePurcharProposal = "/api/v1/PurchaseProposal/"
export const deletePurcharProposal = "/api/v1/PurchaseProposal/"
export const filterPurcharProposal = "/api/v1/PurchaseProposal/filter"

//ProgressProject
export const getTaskProgress = "/api/v1/TaskProgress"
export const addTaskProgress = "/api/v1/TaskProgress"
export const getTaskProgressByID = "/api/v1/TaskProgress/"
export const updateTaskProgress = "/api/v1/TaskProgress/"
export const deleteTaskProgress = "/api/v1/TaskProgress/"
export const filterTaskProgress = "/api/v1/TaskProgress/filter"

//notification
export const filterNotification = "/api/Notification/filter"
export const sendAllUser = "/api/Notification/broadcast"

//jobRequirement
export const getAllJobRequirement = "/api/v1/JobRequirement"
export const addJobRequirement = "/api/v1/JobRequirement"
export const getJobRequirementByID = "/api/v1/JobRequirement/"
export const updateJobRequirement = "/api/v1/JobRequirement/"
export const deleteJobRequirement = "/api/v1/JobRequirement/"
export const filterJobRequirement = "/api/v1/JobRequirement/filter"
export const exportExcelJobRequirement = "/api/v1/JobRequirement/export-excel/"

//employee
export const getAllEmployee = "/api/v1/cthc/employee"
export const addEmployee ="/api/v1/cthc/employee"
export const getEmployeeById = "/api/v1/cthc/employee/"
export const updateEmployee = "/api/v1/cthc/employee/"
export const deleteEmployee = "/api/v1/cthc/employee/"
export const filterEmployee = "/api/v1/cthc/employee/filter"

//leaveRequest
export const getAllLeaveRequest = "/api/v1/cthc/leaverequest"
export const addLeaveRequest = "/api/v1/cthc/leaverequest"
export const getLeaveRequestByID = "/api/v1/cthc/leaverequest/"
export const updateLeaveRequest = "/api/v1/cthc/leaverequest/"
export const deleteLeaveRequest = "/api/v1/cthc/leaverequest/"
export const filterLeaveRequest = "/api/v1/cthc/leaverequest/filter"

// ricereport
export const getAllRiceReport = "/api/v1/ct/ricereport"
export const addRiceReport = "/api/v1/ct/ricereport"
export const getRiceReportByID ="/api/v1/ct/ricereport/"
export const updateRiceReport = "/api/v1/ct/ricereport/"
export const deleteRiceReport = "/api/v1/ct/ricereport/"
export const filterRiceReport = "/api/v1/ct/ricereport/filter"

// timekeeping
export const getAllTimeKeeping = "/api/v1/TimeKeeping"
export const addTimeKeeping = "/api/v1/TimeKeeping"
export const getTimeKeepingByID = "/api/v1/TimeKeeping/"
export const updateTimeKeeping = "/api/v1/TimeKeeping/"
export const deleteTimeKeeping = "/api/v1/TimeKeeping/"
export const filterTimeKeeping = "/api/v1/TimeKeeping/filter"

//kanban
export const getAllKB = "/api/Kanban/boards"
export const addKBB = "/api/Kanban/board"
export const deleteKBB = "/api/Kanban/board/"
export const getTaskKB = "/api/Kanban/tasks"
export const getTaskID = "/api/Kanban/task/"
export const deleteTaskKB = "/api/Kanban/task/"
export const addTask = "/api/Kanban/task"
export const updateStatusTask ="/api/Kanban/task/"