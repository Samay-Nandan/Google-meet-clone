import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { NextApiResponse } from "next";

declare module "next" {
  interface NextApiResponse {
    socket: {
      server: HTTPServer & {
        io?: IOServer;
      };
    };
    end: () => void;
  }
}
