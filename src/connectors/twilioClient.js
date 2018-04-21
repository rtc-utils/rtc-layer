import twilio from 'twilio';
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET
} from "../config";

export default new twilio(TWILIO_ACCOUNT_SID, TWILIO_API_SECRET);
