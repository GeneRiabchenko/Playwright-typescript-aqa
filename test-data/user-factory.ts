import { faker } from '@faker-js/faker';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  website: string;
  recipients: string;
  subject: string;
  message: string;
}

export function createTestUser(overrides?: Partial<TestUser>): TestUser {
  return {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 10 }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    website: faker.internet.url(),
    recipients: faker.internet.email(),
    subject: faker.lorem.words(3),
    message: faker.lorem.sentence(),
    ...overrides,
  };
}
