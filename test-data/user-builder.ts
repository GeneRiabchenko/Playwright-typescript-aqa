import { faker } from '@faker-js/faker';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  website: string;
  subject: string;
  message: string;
}

export class UserBuilder {
  private user: TestUser = {
    email: faker.internet.email(),
    password: faker.internet.password({ length: 10 }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    website: faker.internet.url(),
    subject: faker.lorem.words(3),
    message: faker.lorem.sentence(),
  }

  withEmail(email: string){
    this.user.email = email
    return this
  }

  withPassword(password: string){
    this.user.password = password
    return this
  }

  withFirstName(firstName: string){
    this.user.firstName = firstName
    return this
  }

  withLastName(lastName: string){
    this.user.lastName = lastName
    return this
  }

  withWebsite(website: string){
    this.user.website = website
    return this
  }

  withSubject(subject: string){
    this.user.subject = subject
    return this
  }

  withMessage(message: string){
    this.user.message = message
    return this
  }

  build(): TestUser {
    return {...this.user}
  }
}
