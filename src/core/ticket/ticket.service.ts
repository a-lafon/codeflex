import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Ticket } from './ticket.type';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TicketService {
  private readonly url: string = `${process.env.JIRA_API_URL}/rest/api/3`;
  private readonly token: string = process.env.JIRA_API_TOKEN ?? '';

  constructor(private readonly httpService: HttpService) {}

  async getTicket(ticketId: string): Promise<Ticket> {
    const { data } = await firstValueFrom(
      this.httpService.get<{
        id: string;
        key: string;
        fields: {
          summary: string;
          description: {
            content: {
              content: {
                type: string;
                text: string;
              }[];
            }[];
          } | null;
        };
      }>(`${this.url}/issue/${ticketId}`, {
        headers: {
          Authorization: `Basic ${this.token}`,
        },
      }),
    );

    const description = data.fields.description?.content
      ?.flatMap((c) => c.content)
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n');

    return {
      title: data.fields.summary,
      description,
      id: data.id,
    };
  }
}
