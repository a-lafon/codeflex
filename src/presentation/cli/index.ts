import { NestFactory } from '@nestjs/core';
import { Command } from 'commander';
import { CliModule } from './cli.module';
import { registerReviewCommand } from './commands/review.command';
import { registerTicketReviewCommand } from './commands/ticket-review.command';
import { registerGenerateDocsCommand } from './commands/generate-docs.command';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule, {
    // logger: false,
  });

  const program = new Command();

  registerReviewCommand(program, app);
  registerTicketReviewCommand(program, app);
  registerGenerateDocsCommand(program, app);

  program.parse(process.argv);
  await app.close();
}

bootstrap();
