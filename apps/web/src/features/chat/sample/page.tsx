'use client'

// import { ComponentExample } from '@/components/component-example'
import * as Chat from '@/features/chat/ui'
import mermaid from 'mermaid'
import { useRef, useEffect } from 'react'

export default function Page() {
  const steps = [
    'Situation',
    'Automatic Thought',
    'Mood Rating',
    'Evidence For',
    'Evidence Against',
    'Alternative Thought',
    'Mood Re-rating',
    'Coping Strategy',
  ]

  return (
    <Chat.StepperProvider steps={steps}>
      <Chat.Background>
        <Chat.Root>
          {/* <ComponentExample /> */}
          <Chat.Header>
            <Chat.HeaderGroup>
              <Chat.HeaderRow>
                <Chat.HeaderAvatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN" status="online" />
                <Chat.HeaderInfo name="Pebbles" status="Online" />
                <Chat.Toolbar>
                  <Chat.DialogButton>
                    <Chat.DialogTabs tabs={['Settings', 'Summary', 'About']}>

                      <Chat.DialogTabsContent value="Settings">

                        <Chat.DialogSection title="Data">
                          <Chat.DialogRow label="Import" desc="Load a conversation from a file">
                            <Chat.DialogRowButton>Import</Chat.DialogRowButton>
                          </Chat.DialogRow>
                          <Chat.DialogRow label="Export" desc="Save this conversation to a file">
                            <Chat.DialogRowButton>Export</Chat.DialogRowButton>
                          </Chat.DialogRow>
                        </Chat.DialogSection>

                        <Chat.DialogSection title="Manage">
                          <Chat.DialogRow label="Delete" desc="Permanently remove this conversation">
                            <Chat.DeleteAlertDialog title="Delete chat?" desc="Careful! This will permanently delete this chat conversation.">
                              <Chat.DialogRowButton variant="destructive">Delete</Chat.DialogRowButton>
                            </Chat.DeleteAlertDialog>
                          </Chat.DialogRow>
                        </Chat.DialogSection>

                      </Chat.DialogTabsContent>

                      <Chat.DialogTabsContent value="Summary">
                        <Chat.DialogSection title="Therapeutic Summary">
                          <Chat.DialogRow label="Summarize Session" desc="Generate a therapeutic summary of the session so far">
                            <Chat.DialogRowButton>Summarize</Chat.DialogRowButton>
                          </Chat.DialogRow>
                        </Chat.DialogSection>
                        <Chat.DialogSection title="Therapeutic Summary">
                          <Chart chart={chart} />
                        </Chat.DialogSection>


                      </Chat.DialogTabsContent>

                      <Chat.DialogTabsContent value="About">
                        <Chat.DialogSection title="Therapeutic Summary">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </Chat.DialogSection>
                      </Chat.DialogTabsContent>

                    </Chat.DialogTabs>
                  </Chat.DialogButton>
                </Chat.Toolbar>
              </Chat.HeaderRow>
              <Chat.HeaderRow>
                <Chat.Stepper />
              </Chat.HeaderRow>
            </Chat.HeaderGroup>
          </Chat.Header>

          <Chat.Content>
            <Chat.ScrollArea>

              <Chat.DateSeparator>
                Friday, Feb 20
              </Chat.DateSeparator>

              <Chat.Message variant='sender'>
                <Chat.MessageContent>
                  <Chat.MessageAuthor>Me</Chat.MessageAuthor>
                  <Chat.BubbleGroup>
                    <Chat.Bubble>
                      <Chat.BubbleText>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                  </Chat.BubbleGroup>
                  <Chat.MessageMeta>4:00 PM</Chat.MessageMeta>
                </Chat.MessageContent>
              </Chat.Message>

              <Chat.Message variant='receiver'>
                <Chat.Avatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN" status="online" size="sm" />
                <Chat.MessageContent>
                  <Chat.MessageAuthor>Pebbles</Chat.MessageAuthor>
                  <Chat.BubbleGroup>
                    <Chat.Bubble>
                      <Chat.BubbleText>
                        {
                          'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.\n\n'
                          + '*Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.*\n\n'
                          + '_Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem._\n\n'
                          + '~Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?~\n\n'
                          + '`Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?`\n\n'
                          + 'Tutorial Link: https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                        }
                      </Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                    <Chat.Bubble>
                      <Chat.BubbleText>Hello World</Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                    <Chat.Bubble>
                      <Chat.BubbleText>I am a programmer</Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                    <Chat.Bubble>
                      <Chat.BubbleText>I'm currently designing this webpage</Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                    <Chat.Bubble>
                      <Chat.BubbleText>Hope you like it!</Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                  </Chat.BubbleGroup>
                  <Chat.MessageMeta>4:00 PM</Chat.MessageMeta>
                </Chat.MessageContent>
              </Chat.Message>

              <Chat.DateSeparator>
                Today
              </Chat.DateSeparator>

              <Chat.Message variant='sender'>
                <Chat.MessageContent>
                  <Chat.MessageAuthor>Me</Chat.MessageAuthor>
                  <Chat.BubbleGroup>
                    <Chat.Bubble>
                      <Chat.BubbleText>Hello World</Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                    <Chat.Bubble>
                      <Chat.BubbleText>I am a _programmer_</Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                    <Chat.Bubble>
                      <Chat.BubbleText>I'm currently designing this webpage</Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                    <Chat.Bubble>
                      <Chat.BubbleText>Hope you like it!</Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                  </Chat.BubbleGroup>
                  <Chat.MessageMeta>4:00 PM</Chat.MessageMeta>
                </Chat.MessageContent>
              </Chat.Message>

              <Chat.Message variant='receiver' align='bottom'>
                <Chat.Avatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN" status="online" size="sm" />
                <Chat.MessageContent>
                  <Chat.MessageAuthor>Pebbles</Chat.MessageAuthor>
                  <Chat.BubbleGroup>
                    <Chat.Bubble>
                      <Chat.BubbleText>Hello world!</Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                    <Chat.Bubble>
                      <Chat.BubbleText></Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                    <Chat.Bubble>
                      <Chat.BubbleText>Empty bubble above!</Chat.BubbleText>
                      <Chat.BubbleActions>
                        <Chat.BubbleCopyButton value={'Hello world'} />
                      </Chat.BubbleActions>
                    </Chat.Bubble>
                  </Chat.BubbleGroup>
                  <Chat.MessageMeta status="read">4:00 PM</Chat.MessageMeta>
                </Chat.MessageContent>
              </Chat.Message>

              <Chat.Message variant='receiver'>
                <Chat.Avatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN" status="online" size="sm" />
                <Chat.MessageContent>
                  <Chat.MessageAuthor>Pebbles</Chat.MessageAuthor>
                  <Chat.BubbleGroup>
                    <Chat.Bubble>
                      <Chat.BubbleText typing />
                    </Chat.Bubble>
                  </Chat.BubbleGroup>
                </Chat.MessageContent>
              </Chat.Message>

            </Chat.ScrollArea>
            <Chat.ScrollButton />
          </Chat.Content>

          <Chat.Composer>
            <Chat.ComposerGroup>
              <Chat.ComposerInput id="chat-input" placeholder="Send a message..." />
              <Chat.ComposerToolbar>
                <Chat.ComposerCharCount value={280} max={1000} />
                <Chat.ComposerSendButton className="ml-auto" />
              </Chat.ComposerToolbar>
            </Chat.ComposerGroup>
            <Chat.ComposerMeta>
              Pebbles is powered by AI and may not always be accurate. Not a substitute for professional help.
            </Chat.ComposerMeta>
          </Chat.Composer>
        </Chat.Root>
      </Chat.Background>
    </Chat.StepperProvider>
  )
}

const chart = `
  graph LR
    0(Situation) -->
    1(Automatic Thought) -->
    2(Mood Rating) -->
    3(Evidence For) -->
    4(Evidence Against) -->
    5(Alternative Thought) -->
    6(Mood Re-rating) -->
    7(Coping Strategy)
`

mermaid.initialize({ startOnLoad: false })

function Chart({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    if (!ref.current) return
    // Remove existing element with this ID before re-rendering
    document.getElementById(idRef.current)?.remove()
    mermaid.render(idRef.current, chart)
      .then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg
      })
      .catch(console.error)
  }, [chart])

  return <div ref={ref} />
}
