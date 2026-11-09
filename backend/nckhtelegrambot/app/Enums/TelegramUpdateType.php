<?php

namespace App\Enums;

enum TelegramUpdateType: string
{
    case MESSAGE = 'message';
    case CALLBACK_QUERY = 'callback_query';
    case MY_CHAT_MEMBER = 'my_chat_member';
    case CHANNEL_POST = 'channel_post';
    case EDITED_MESSAGE = 'edited_message';
    case UNKNOWN = 'unknown';

    /**
     * Determine the update type from raw Telegram update payload.
     */
    public static function fromUpdate(array $update): self
    {
        if (isset($update['message'])) {
            return self::MESSAGE;
        }

        if (isset($update['callback_query'])) {
            return self::CALLBACK_QUERY;
        }

        if (isset($update['my_chat_member'])) {
            return self::MY_CHAT_MEMBER;
        }

        if (isset($update['channel_post'])) {
            return self::CHANNEL_POST;
        }

        if (isset($update['edited_message'])) {
            return self::EDITED_MESSAGE;
        }

        return self::UNKNOWN;
    }

    public function isMessage(): bool
    {
        return $this === self::MESSAGE;
    }

    public function isCallbackQuery(): bool
    {
        return $this === self::CALLBACK_QUERY;
    }

    public function isChatMember(): bool
    {
        return $this === self::MY_CHAT_MEMBER;
    }
}
