import { faker } from '@faker-js/faker';

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: {
    username: string;
    bio: string | null;
    image: string;
    following: boolean;
  };
}

export class ArticleBuilder {
  private article: Article = {
    slug: faker.lorem.slug(),
    title: faker.lorem.sentence(3),
    description: faker.lorem.sentence(),
    body: faker.lorem.paragraph(),
    tagList: [faker.lorem.word()],
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.past().toISOString(),
    favorited: false,
    favoritesCount: faker.number.int({ min: 0, max: 5000 }),
    author: {
      username: faker.person.fullName(),
      bio: null,
      image: faker.image.avatar(),
      following: false,
    },
  }

  withSlug(slug: string) {
    this.article.slug = slug
    return this
  }

  withTitle(title: string) {
    this.article.title = title
    return this
  }

  withDescription(description: string) {
    this.article.description = description
    return this
  }

  withBody(body: string) {
    this.article.body = body
    return this
  }

  withTags(tagList: string[]) {
    this.article.tagList = tagList
    return this
  }

  withFavoritesCount(favoritesCount: number) {
    this.article.favoritesCount = favoritesCount
    return this
  }

  withAuthor(username: string) {
    this.article.author.username = username
    return this
  }

  build(): Article {
    return { ...this.article, author: { ...this.article.author } }
  }
}

export function buildArticlesResponse(articles: Article[]) {
  return { articles, articlesCount: articles.length }
}
