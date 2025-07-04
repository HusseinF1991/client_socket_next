// Define available events to emit
export const AVAILABLE_EVENTS = [
  //clinic system
  // { id: "SEND_START_DIAGNOSIS", name: "Start Diagnosis", defaultPayload: { patientId: "" } },
  // { id: "SEND_DIAGNOSIS_COMPLETED", name: "Diagnosis Completed", defaultPayload: { patientId: "" } },
  //alpha
  //not used
  /*   {
    id: "SEND_EDIT_CONVO_MSG",
    name: "Edit Conversation Message",
    defaultPayload: { messageId: "", newContent: "" },
  }, */
  {
    id: "SEND_DEL_CONVO_MSG",
    name: "Delete Conversation Message",
    defaultPayload: { id: "message id", ConversationId: "" },
  },
  //not used
  /*   {
    id: "SEND_MSG_REACTION",
    name: "Message Reaction",
    defaultPayload: { messageId: "", reaction: "" },
  }, */
  {
    id: "SEND_LEAVE_CONVERSATION",
    name: "Leave Conversation",
    defaultPayload: { id: "conersation id" },
  },
  //not used
  /*   {
    id: "SEND_CHANGE_PS_SHARING_STATE",
    name: "Change PS Sharing State",
    defaultPayload: { state: "" },
  }, */
  //not used
  /*   {
    id: "SEND_CHANGE_PS_MUTE_STATE",
    name: "Change PS Mute State",
    defaultPayload: { state: "" },
  }, */
  //not used
  // { id: "SEND_GO_OFFLINE", name: "Go Offline", defaultPayload: {} },
  {
    id: "SEND_CONVO_MSG_READ",
    name: "Conversation Message Read",
    defaultPayload: {
      ConversationId: "",
      LastReadMessageId: "",
      unreadMessagesCount: 9,
    },
  },
  {
    id: "SEND_AI_CONVO_MSG",
    name: "send message to AI",
    defaultPayload: {
      content:
        "content message eg: create workouts routine based on my profile",
      messageType: "TEXT | GEN_WRKTS_ROUT | GEN_NUTR_ROUT",
      Trainee: {
        //for workouts routine
        trainGoal: "MUSCLE_GAIN",
        fitnessLevel: "INTERMEDIATE",
        equipmentAvailability: "EA_BASIC_HOME",
        workoutsDaysPerWeekPref: 3,
        workoutsSessionDurationPref: "WSD_SHORT",
        sleepPattern: "SP_CONSISTENT",
        activityLevel: "LIGHT",
        targetWeight: 75,
        workoutsTypesPref: ["WT_STRENGTH_TRAINING"], // accept empty array
        injuries: ["I_SHOULDER_PAIN", "I_LOWER_BACK_PAIN"], // accept empty array
        targetBodyParts: [
          "CHEST",
          "BACK",
          "SHOULDER",
          "LEG",
          "HAND",
          "ABDOMEN",
          "HIP",
          "SHOULDER",
        ], // accept empty array
        chronicConditions: [], // accept empty array
        //for nutrition routine
        mealsFreqAndTimingPref: "MS_STANDARD",
        mealsFreqAndTimingHabits: "MS_STANDARD",
        dietaryGoals: ["DG_WEIGHT_LOSS"],
        dietaryPreferences: [],
        restrictedFood: ["RF_ALCOHOL", "RF_SWEETS"],
        User: {
          gender: "male",
          age: 33,
          height: 170,
        },
        TraineeWeight: {
          id: "sent in case of update only",
          value: 75,
        },
      },
    },
  },
];

// Define events to listen for
export const EVENTS_TO_LISTEN = [
  //clinic system
  // "RECEIVE_START_DIAGNOSIS",
  // "RECEIVE_DIAGNOSIS_COMPLETED",
  // "RECEIVE_TODAY_QUEUE_UPDATED",

  //alpha
  "RECEIVE_NEW_CONVO_MSG",
  "RECEIVE_EDIT_CONVO_MSG",
  "RECEIVE_DEL_CONVO_MSG",
  "RECEIVE_MSG_REACTION",
  "RECEIVE_LEFT_CONVERSATION",
  "RECEIVE_CHANGE_PS_SHARING_STATE",
  "RECEIVE_CHANGE_PS_MUTE_STATE",
  "RECEIVE_PARTICIPANT_IS_OFFLINE",
  "RECEIVE_PARTICIPANT_IS_ONLINE",
  "RECEIVE_CONVO_MSG_READ",
  "GROUP_CONVO_INFO_UPDATED",
  "RECEIVE_AI_CONVO_MSG",
];
