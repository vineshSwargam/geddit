import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { db } from '@/lib/db';
import PostFeed from '../PostFeed';
import { ExtendedPost } from '@/types/db';

interface CustomFeedProps { 
  userSubscriptions: ExtendedPost[];
}

const CustomFeed = async ({ userSubscriptions }: CustomFeedProps) => {
  const userSubscriptionNames = userSubscriptions.map((sub) => sub.subreddit.name);
  const posts = await db.post.findMany({
    where: {
      subreddit: {
        name: {
          in: userSubscriptionNames,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLL_PAGINATION_RESULTS,
  })

  return <PostFeed initialPosts={posts} />
}

export default CustomFeed
