import { TicketStatus, TicketType } from "../../enums/TicketStatus";

export interface TicketResponse {
  id: string;
  fromStationName: string;
  toStationName: string;
  fare: number;
  createdAt: string;
  expiredAt: string;
  ticketStatus: TicketStatus;
  ticketType : TicketType;

  qrCode: string;
}