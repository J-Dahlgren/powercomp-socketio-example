const { config } = require("dotenv");
const { connect } = require("socket.io-client");
const { NSP_STATE_EVENT, ROOM, NSP_PARTIAL_STATE_EVENT } = require("./events");
const {
  APP_INFO_NSP,
  PLATFORM_NSP,
  PLATFORM_EVENTS_NSP,
} = require("./namespace");
config({ path: "./example.env" });
/**
 * Manipulate the competition with the application at SERVER_URL or via the api that is documented at SERVER_URL/docs '
 */
const host = process.env.SERVER_URL;

/**
 * Room has to be a string.
 * Server only allows being in one room at a time, joining another will leave the previous.
 * May allow multiple rooms in the future.
 */
const targetRoom = process.env.TARGET_ROOM || "1";
const appInfo = connect(`${host}/${APP_INFO_NSP}`);
appInfo.on("connect", () => {
  console.log("connected");
  appInfo.on(NSP_STATE_EVENT, (data) => console.log(APP_INFO_NSP, data));
});

const platformData = connect(`${host}/${PLATFORM_NSP}`);
platformData.on("connect", () => {
  platformData.on(NSP_PARTIAL_STATE_EVENT, (data) => {
    const { room, type, payload } = data;
    /*
      Types:
      activeGroupId
      currentLifter
      nextLifter
      lifters
    */
    console.log(PLATFORM_NSP, data);
  });
  platformData.emit(ROOM.JOIN, targetRoom);
});

const platformEvents = connect(`${host}/${PLATFORM_EVENTS_NSP}`);
platformEvents.on("connect", () => {
  platformEvents.on(NSP_PARTIAL_STATE_EVENT, (data) => {
    const { room, type, payload } = data;
    /*
      Types:
      liftTimer
      decisions
      displayDecisions
    */
    console.log(PLATFORM_EVENTS_NSP, data);
  });
  platformEvents.emit(ROOM.JOIN, targetRoom);
});

appInfo.on("connect_error", (e) => {
  console.log(APP_INFO_NSP, "error", e);
});
platformData.on("connect_error", (e) => {
  console.log(PLATFORM_NSP, "error", e);
});
platformEvents.on("connect_error", (e) => {
  console.log(PLATFORM_EVENTS_NSP, "error", e);
});
