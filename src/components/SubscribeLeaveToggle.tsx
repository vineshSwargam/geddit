'use client'
import { Button } from '@/components/ui/Button'
import { SubscribeToSubredditPayload } from '@/lib/validators/subreddit'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { startTransition, useState } from 'react'
import { useToast } from '../hooks/use-toast'
import { useCustomToasts } from '@/hooks/use-custom-toasts'

interface SubscribeLeaveToggleProps {
  isSubscribed: boolean
  subredditId: string
  subredditName: string
}

enum SubscriptionType {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
}

const SubscribeLeaveToggle = ({
  isSubscribed,
  subredditId,
  subredditName,
}: SubscribeLeaveToggleProps) => {
  const { toast } = useToast()
  const { loginToast } = useCustomToasts()
  const router = useRouter();
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState<boolean>(false);

  const handleSubscription = async (subType: SubscriptionType) => {
    try {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      }
      const { data } = await axios.post(`/api/subreddit/${subType}`, payload);
      startTransition(() => {
        // Refresh the current route and fetch new data from the server without losing client-side browser or React state.
        router.refresh();
      });
      const getToastMessage = () => {
        if (subType === SubscriptionType.SUBSCRIBE) {
          return {
            title: 'SUBSCRIBED',
            description: `You are now subscribed to r/${subredditName}`,
          };
        }
        return {
          title: 'UNSUBSCRIBED',
          description: `You are now unsubscribed from r/${subredditName}`,
        };
      };

      toast(getToastMessage());
      return data as string;

    } catch (err: any) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast()
        }
      }

      return toast({
        title: 'There was a problem.',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }


  return isSubscribed ? (
    <Button
      className='w-full mt-1 mb-4'
      isLoading={isUnsubscribing}
      onClick={() => handleSubscription(SubscriptionType.UNSUBSCRIBE)}>
      Leave community
    </Button>
  ) : (
    <Button
      className='w-full mt-1 mb-4'
      isLoading={isSubscribing}
      onClick={() => handleSubscription(SubscriptionType.SUBSCRIBE)}>
      Join to post
    </Button>
  )
}

export default SubscribeLeaveToggle
