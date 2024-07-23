"use client"

import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense'
import React, { KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { Editor } from '@/components/editor/Editor'
import Header from '@/components/Header'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import ActiveCollavorator from './ActiveCollavorator'
import { Input } from './ui/input'
import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import { updateDocument } from '@/lib/actions/room.actions'
import Loader from './Loader'
import ShareModal from './ShareModal'
const CollaborativeRoom = ({ roomId, roomMetadata, users, currentUserType }: CollaborativeRoomProps) => {
    const [title, setTitle] = useState(roomMetadata.title);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);


    const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setLoading(true);
            try {
                if (title !== roomMetadata.title) {
                    console.log('workkkkk');

                    const updatedDocument = await updateDocument(roomId, title)
                    if (updatedDocument) {
                        setEditing(false);
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.log('Title update error ', error);

            }
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setEditing(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [roomId, title])

    return (
        <RoomProvider id={roomId}>
            <ClientSideSuspense fallback={<Loader />}>
                <div className='collaborative-room'>
                    <Header>
                        <div ref={containerRef} className="flex w-fit items-center justify-center gap-2">
                            {
                                editing && !loading ? (
                                    <Input type='text'
                                        value={title}
                                        ref={inputRef}
                                        placeholder='Enter title'
                                        onChange={(e) => setTitle(e.target.value)}
                                        onKeyDown={updateTitleHandler}
                                        disabled={!editing}
                                        className='document-title-input'
                                    />
                                ) : (
                                    <p className='document-title'>{title}</p>
                                )
                            }

                            {
                                currentUserType === 'editor' && !editing && (
                                    <Image src='/assets/icons/edit.svg'
                                        alt="edit"
                                        width={24}
                                        height={24}
                                        onClick={() => setEditing(true)}
                                        className='pointer'
                                    />
                                )
                            }

                            {
                                currentUserType !== 'editor' && !editing && (
                                    <p className='view-only-tag'>View Only</p>
                                )
                            }

                            {
                                loading && <p className='text-sm text-gray-400'>Saving...</p>
                            }

                        </div>
                        <div className='flex w-full flex-1 justify-end gap-2 sm:gap-3'>
                            <ActiveCollavorator />
                            <ShareModal
                                roomId={roomId}
                                collaborators={users}
                                creatorId={roomMetadata.creatorId}
                                currentUserType={currentUserType}
                            />
                            <SignedOut>
                                <SignInButton />
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>
                    </Header>
                    <Editor roomId={roomId} currentUserType={currentUserType} />
                </div>
            </ClientSideSuspense>
        </RoomProvider>
    )
}

export default CollaborativeRoom