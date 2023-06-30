'use client'

import { useCustomToasts } from '@/hooks/use-custom-toasts'
import { PostVoteRequest } from '@/lib/validators/vote'
import { usePrevious } from '@mantine/hooks'
import { VoteType } from '@prisma/client'
import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { toast } from '../../hooks/use-toast'
import { Button } from '../ui/Button'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostVoteClientProps {
  postId: string
  initialVotesAmt: number
  initialVote?: VoteType | null
}

const PostVoteClient = ({
  postId,
  initialVotesAmt,
  initialVote,
}: PostVoteClientProps) => {
  const { loginToast } = useCustomToasts()
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt)
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [currentVote, setCurrentVote] = useState(initialVote)
  const prevVote = usePrevious(currentVote);

  // ensure sync with server
  useEffect(() => {
    setCurrentVote(initialVote)
  }, [initialVote])

  const handleVoteMutation = async (voteType: VoteType) => {
    if (currentVote === voteType) {
      // User is voting the same way again, so remove their vote
      setCurrentVote(undefined)
      if (voteType === 'UP') setVotesAmt((prev) => prev - 1)
      else if (voteType === 'DOWN') setVotesAmt((prev) => prev + 1)
    } else {
      // User is voting in the opposite direction, so subtract 2
      setCurrentVote(voteType)
      if (voteType === 'UP') setVotesAmt((prev) => prev + (currentVote ? 2 : 1))
      else if (voteType === 'DOWN')
        setVotesAmt((prev) => prev - (currentVote ? 2 : 1))
    }
  }

  const handleRevertVoteMutation = (type: VoteType, err: any) => {
    if (type === 'UP') setVotesAmt((prev) => prev - 1);
      else setVotesAmt((prev) => prev + 1);
      // reset current vote
      setCurrentVote(prevVote);
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
    
      return toast({
        title: 'Something went wrong.',
        description: 'Your vote was not registered. Please try again.',
        variant: 'destructive',
      });
  }

  const vote = async (type: VoteType) => {
    setIsVoting(true);
    await handleVoteMutation(type);
    try {
      const payload: PostVoteRequest = {
        voteType: type,
        postId: postId,
      }
      await axios.patch('/api/subreddit/post/vote', payload);
    } catch (err) {
      handleRevertVoteMutation(type, err);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className='flex flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0'>
      {/* upvote */}
      <Button
        onClick={() => vote('UP')}
        size='sm'
        variant='ghost'
        disabled={isVoting}
        aria-label='upvote'>
        <ArrowBigUp
          className={cn('h-5 w-5 text-zinc-700', {
            'text-emerald-500 fill-emerald-500': currentVote === 'UP',
          })}
          />
      </Button>

      {/* score */}
      <p className='text-center py-2 font-medium text-sm text-zinc-900'>
        {votesAmt}
      </p>

      {/* downvote */}
      <Button
        onClick={() => vote('DOWN')}
        disabled={isVoting}
        size='sm'
        className={cn({
          'text-emerald-500': currentVote === 'DOWN',
        })}
        variant='ghost'
        aria-label='upvote'>
        <ArrowBigDown
          className={cn('h-5 w-5 text-zinc-700', {
            'text-red-500 fill-red-500': currentVote === 'DOWN',
          })}
        />
      </Button>
    </div>
  )
}

export default PostVoteClient
