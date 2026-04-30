/// AUTO-GENERATED FILE — do not edit by hand
/// Bot API 9.6.0
/// source: https://corefork.telegram.org/bots/api
/// generated at: 2026-04-30T14:12:46.898Z
/// see scripts/emit.ts in @puregram/api

export const FORMATTABLE_FIELDS = {
    "copyMessage": [
        {
            path: ["caption"],
            textKey: "caption",
            entitiesKey: "caption_entities"
        },
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "editMessageCaption": [
        {
            path: ["caption"],
            textKey: "caption",
            entitiesKey: "caption_entities"
        }
    ],
    "editMessageChecklist": [
        {
            path: ["checklist", "title"],
            textKey: "title",
            entitiesKey: "title_entities"
        },
        {
            path: ["checklist", "tasks", "*", "text"],
            textKey: "text",
            entitiesKey: "text_entities"
        }
    ],
    "editMessageText": [
        {
            path: ["text"],
            textKey: "text",
            entitiesKey: "entities"
        }
    ],
    "editStory": [
        {
            path: ["caption"],
            textKey: "caption",
            entitiesKey: "caption_entities"
        }
    ],
    "giftPremiumSubscription": [
        {
            path: ["text"],
            textKey: "text",
            entitiesKey: "text_entities"
        }
    ],
    "postStory": [
        {
            path: ["caption"],
            textKey: "caption",
            entitiesKey: "caption_entities"
        }
    ],
    "sendAnimation": [
        {
            path: ["caption"],
            textKey: "caption",
            entitiesKey: "caption_entities"
        },
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendAudio": [
        {
            path: ["caption"],
            textKey: "caption",
            entitiesKey: "caption_entities"
        },
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendChecklist": [
        {
            path: ["checklist", "title"],
            textKey: "title",
            entitiesKey: "title_entities"
        },
        {
            path: ["checklist", "tasks", "*", "text"],
            textKey: "text",
            entitiesKey: "text_entities"
        },
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendContact": [
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendDice": [
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendDocument": [
        {
            path: ["caption"],
            textKey: "caption",
            entitiesKey: "caption_entities"
        },
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendGame": [
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendGift": [
        {
            path: ["text"],
            textKey: "text",
            entitiesKey: "text_entities"
        }
    ],
    "sendInvoice": [
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendLocation": [
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendMediaGroup": [
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendMessage": [
        {
            path: ["text"],
            textKey: "text",
            entitiesKey: "entities"
        },
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendMessageDraft": [
        {
            path: ["text"],
            textKey: "text",
            entitiesKey: "entities"
        }
    ],
    "sendPaidMedia": [
        {
            path: ["caption"],
            textKey: "caption",
            entitiesKey: "caption_entities"
        },
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendPhoto": [
        {
            path: ["caption"],
            textKey: "caption",
            entitiesKey: "caption_entities"
        },
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendPoll": [
        {
            path: ["question"],
            textKey: "question",
            entitiesKey: "question_entities"
        },
        {
            path: ["explanation"],
            textKey: "explanation",
            entitiesKey: "explanation_entities"
        },
        {
            path: ["description"],
            textKey: "description",
            entitiesKey: "description_entities"
        },
        {
            path: ["options", "*", "text"],
            textKey: "text",
            entitiesKey: "text_entities"
        },
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendSticker": [
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendVenue": [
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendVideo": [
        {
            path: ["caption"],
            textKey: "caption",
            entitiesKey: "caption_entities"
        },
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendVideoNote": [
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ],
    "sendVoice": [
        {
            path: ["caption"],
            textKey: "caption",
            entitiesKey: "caption_entities"
        },
        {
            path: ["reply_parameters", "quote"],
            textKey: "quote",
            entitiesKey: "quote_entities"
        }
    ]
} as const;