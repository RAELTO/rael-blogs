import { Link } from 'react-router-dom'
import { Check, MessageCircle, UserCheck, UserPlus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import Avatar from '../ui/Avatar'
import { useToast } from '../ui/Toast'
import { useSendContactRequest, useRespondContactRequest } from '../../features/contacts/useContactMutations'
import { useGetOrCreateConversation } from '../../features/chat/useGetOrCreateConversation'
import { useOpenChat } from '../../features/chat/useOpenChat'
import { useSearchPeople, type SearchPersonResult } from '../../features/search/useSearchPeople'

interface Props {
  query: string
  userId: string
}

function SearchPersonRow({
  result,
  userId,
}: {
  result: SearchPersonResult
  userId: string
}) {
  const qc = useQueryClient()
  const toast = useToast()
  const sendRequest = useSendContactRequest(userId)
  const respond = useRespondContactRequest(userId)
  const getOrCreate = useGetOrCreateConversation(userId)
  const openChat = useOpenChat()
  const { profile, status, requestId } = result

  async function handleAdd() {
    await sendRequest.mutateAsync(profile.id)
    toast('Contact request sent')
  }

  async function handleAccept() {
    if (!requestId) return
    await respond.mutateAsync({ requestId, requesterId: profile.id, accept: true })
    await qc.invalidateQueries({ queryKey: ['search-people'] })
    toast(`${profile.display_name} is now your contact`)
  }

  async function handleMessage() {
    const conversationId = await getOrCreate.mutateAsync(profile.id)
    openChat({
      conversationId,
      otherId: profile.id,
      otherName: profile.display_name,
      otherUsername: profile.username,
      otherAvatar: profile.avatar_url,
    })
  }

  const busy = sendRequest.isPending || respond.isPending || getOrCreate.isPending

  return (
    <div className="search-person-row">
      <Link to={`/profile/${profile.username}`} style={{ display: 'flex', textDecoration: 'none' }}>
        <Avatar name={profile.display_name} src={profile.avatar_url} size="md" />
      </Link>

      <Link
        to={`/profile/${profile.username}`}
        className="search-person-copy"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="search-person-name">{profile.display_name}</div>
        <div className="search-person-meta">@{profile.username}</div>
        {status === 'contact' && (
          <div className="search-person-status">Already in contacts</div>
        )}
        {status === 'pending_received' && (
          <div className="search-person-status">Sent you a contact request</div>
        )}
      </Link>

      <div className="search-person-actions">
        {status === 'contact' && (
          <button className="btn btn-small btn-primary" type="button" onClick={handleMessage} disabled={busy}>
            <MessageCircle size={14} strokeWidth={2.5} /> Message
          </button>
        )}

        {status === 'pending_received' && (
          <button className="btn btn-small btn-primary" type="button" onClick={handleAccept} disabled={busy}>
            <UserCheck size={14} strokeWidth={2.5} /> Accept
          </button>
        )}

        {status === 'pending_sent' && (
          <button className="btn btn-small" type="button" disabled>
            <Check size={14} strokeWidth={2.5} /> Request sent
          </button>
        )}

        {status === 'none' && (
          <button className="btn btn-small btn-primary" type="button" onClick={handleAdd} disabled={busy}>
            <UserPlus size={14} strokeWidth={2.5} /> Add contact
          </button>
        )}
      </div>
    </div>
  )
}

export default function SearchPeopleResults({ query, userId }: Props) {
  const { data: people = [], isLoading, isError } = useSearchPeople(query, userId)

  return (
    <section className="panel search-people-panel">
      <div className="search-section-head">
        <div>
          <h2>People</h2>
          <p>Name and username matches</p>
        </div>
      </div>

      {isLoading && (
        <div className="search-people-empty">Searching people...</div>
      )}

      {isError && (
        <div className="search-people-empty">People search failed.</div>
      )}

      {!isLoading && !isError && people.length === 0 && (
        <div className="search-people-empty">No people found.</div>
      )}

      {!isLoading && !isError && people.length > 0 && (
        <div className="search-people-list">
          {people.map(result => (
            <SearchPersonRow
              key={result.profile.id}
              result={result}
              userId={userId}
            />
          ))}
        </div>
      )}
    </section>
  )
}
