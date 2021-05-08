import { Application } from 'stimulus';
import TalkController from "../controllers/talk_controller.js";

const application = Application.start();
application.register("talk", TalkController);