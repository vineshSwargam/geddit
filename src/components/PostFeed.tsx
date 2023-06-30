'use client'

import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { ExtendedPost } from '@/types/db'
import { useIntersection } from '@mantine/hooks'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { FC, useEffect, useRef, useState } from 'react'
import Post from './Post'

interface PostFeedProps {
  initialPosts: ExtendedPost[]
  subredditName?: string
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName }) => {
  const { data: session } = useSession()
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });
  const [intersectingPostId, setIntersectingPostId] = useState<boolean>(false);
  const [posts, setPosts] = useState<ExtendedPost[]>(initialPosts);
  const [nextPageNumber, setNextPageNumber] = useState<number>(2);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState<boolean>(false);

  const fetchNextPage = async (pageNumber: number) => {
    setIsFetchingNextPage(true);
    try {
      const pageQueryParam = `?limit=${INFINITE_SCROLL_PAGINATION_RESULTS}&page=${pageNumber}`;
      const subredditQueryParam = !!subredditName ? `&subredditName=${subredditName}` : '';
      const query = `/api/posts${pageQueryParam}${subredditQueryParam}`;
      const { data } = await axios.get(query);
      // if ((data as ExtendedPost[]).at(-1)?.id === posts.at(-1)?.id) {

      // }
      setPosts([...posts, ...data]);
      setNextPageNumber(pageNumber + 1);
      return data as ExtendedPost[];
    } catch (err) {
      setNextPageNumber(pageNumber);
    } finally {
      setIsFetchingNextPage(false);
    }
  };

  useEffect(() => {
    // setIsFetchingNextPage(true);
    console.log({ isIntersecting: entry?.isIntersecting, isFetchingNextPage });
    if (entry?.isIntersecting && !isFetchingNextPage) {
      console.log('FETCHING');
      fetchNextPage(nextPageNumber); // Load more posts when the last post comes into view
    }
    // setIsFetchingNextPage(false);
  }, [entry?.isIntersecting])

  console.log({ posts });

  return (
    <ul className='flex flex-col col-span-2 space-y-6'>
      {posts.map((post, index) => {
        const votesAmt = post.votes.reduce((acc, vote) => {
          if (vote.type === 'UP') return acc + 1
          if (vote.type === 'DOWN') return acc - 1
          return acc
        }, 0)

        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        )

        if (index === posts.length - 1) {
          // Add a ref to the last post in the list
          return (
            <li key={post.id} ref={ref}>
              <Post
                post={post}
                commentAmt={post.comments.length}
                subredditName={post.subreddit.name}
                votesAmt={votesAmt}
                currentVote={currentVote}
              />
            </li>
          )
        } else {
          return (
            <Post
              key={post.id}
              post={post}
              commentAmt={post.comments.length}
              subredditName={post.subreddit.name}
              votesAmt={votesAmt}
              currentVote={currentVote}
            />
          )
        }
      })}

      {isFetchingNextPage && (
        <li className='flex justify-center'>
          <Loader2 className='w-6 h-6 text-zinc-500 animate-spin' />
        </li>
      )}
    </ul>
  )
}

export default PostFeed
