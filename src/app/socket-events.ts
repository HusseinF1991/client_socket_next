// Define available events to emit
export const AVAILABLE_EVENTS = [
  //clinic system
  { id: "SEND_START_DIAGNOSIS", name: "Start Diagnosis", defaultPayload: { patientId: "" } },
  { id: "SEND_DIAGNOSIS_COMPLETED", name: "Diagnosis Completed", defaultPayload: { patientId: "" } },
  //alpha
  /* {
    id: "SEND_EDIT_CONVO_MSG",
    name: "Edit Conversation Message",
    defaultPayload: { messageId: "", newContent: "" },
  },
  {
    id: "SEND_DEL_CONVO_MSG",
    name: "Delete Conversation Message",
    defaultPayload: { messageId: "" },
  },
  {
    id: "SEND_MSG_REACTION",
    name: "Message Reaction",
    defaultPayload: { messageId: "", reaction: "" },
  },
  {
    id: "SEND_LEAVE_CONVERSATION",
    name: "Leave Conversation",
    defaultPayload: { conversationId: "" },
  },
  {
    id: "SEND_CHANGE_PS_SHARING_STATE",
    name: "Change PS Sharing State",
    defaultPayload: { state: "" },
  },
  {
    id: "SEND_CHANGE_PS_MUTE_STATE",
    name: "Change PS Mute State",
    defaultPayload: { state: "" },
  },
  { id: "SEND_GO_OFFLINE", name: "Go Offline", defaultPayload: {} },
  {
    id: "SEND_CONVO_MSG_READ",
    name: "Conversation Message Read",
    defaultPayload: { messageId: "" },
  },
  {
    id: "GENERATE_AI_WORKOUT_ROUTINE",
    name: "Generate AI Workout Routine",
    defaultPayload: {
      trainGoal: "MUSCLE_GAIN",
      fitnessLevel: "INTERMEDIATE",
      equipmentAvailability: "BASIC_HOME",
      workoutsDaysPerWeekPref: 3,
      workoutsSessionDurationPref: "SHORT",
      workoutsTypesPref: ["STRENGTH_TRAINING"],
      sleepPattern: "CONSISTENT",
      activityLevel: "LIGHT",
      injuries: ["SHOULDER_PAIN" , "LOWER_BACK_PAIN"],
      chronicConditions: [],
      gender: "male",
      age: 33,
      height: 170,
      weight: 75,
      targetWeight: 75,
      targetBodyParts: ["CHEST", "BACK", "SHOULDER", "LEG", "HAND", "ABDOMEN", "HIP", "SHOULDER"],
    },
  }, */
];

// Define events to listen for
export const EVENTS_TO_LISTEN = [
  //clinic system
  "RECEIVE_START_DIAGNOSIS",
  "RECEIVE_DIAGNOSIS_COMPLETED",
  "RECEIVE_TODAY_QUEUE_UPDATED",

  // //alpha
/*   "RECEIVE_NEW_CONVO_MSG",
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
  //ai workouts routine
  "AI_WORKOUT_GENERATING",
  "AI_WORKOUT_DATA",
  "AI_WORKOUT_DAY",
  "AI_WORKOUT_COMPLETE",
  "AI_WORKOUT_ERROR", */
];
