# Resource

Resource is a raw media or text for language learning. It will be converted into a Material when it is learning-ready.

Resource can be of type:
- Text (Ready for extraction).
- URL (Needs a crawler to extract raw contents, then feed to LLM for cleanup, then extraction).
- Image (Needs Multimodal LLM for extraction).
- Video (Needs Multimodal LLM for extraction).

Resource Type (typed enum in code is OK)
- text
- url
- image
- video

Resource entity:
- user_id
- name
- type
- content (stores actual text for text, stores URL for URL, stores the image/video MinIO URL path excluding the base domain)

# Resource Processing Queue

Resources are then sent as background jobs when issued for processing. A service for processing the AI will then pick up one unprocessed but ready to process resources to send to AI.

Resource Queue entity:
- resource_id
- status (pending, processing, completed, canceled, failed)
- retry_count (integer showing how much to retry, will determine if a job should be picked up)
- last_processing_attempt_at (last time the job is processed. this will determine priority if failed)
- prompt (the prompt used, excluding the default system prompt)

Resource Queue Log entity:
- resource_queue_id
- start_at
- end_at
- status (completed, canceled, failed)
- status_info (error text for debugging)
- response (AI response, should be in JSON)

Add endpoints to:
- List current user's queued resources: GET /api/resource/queue
- Push a new resource for queue: POST /api/resource/queue
- Cancel a resource for queue: DELETE /api/resource/queue/{resource_queue_id}, update the log status to canceled

# Material

Materials are learning-ready material, ready to use by the app and web app for learning without having to use the AI again.

Material entity:
- resource_id
- user_id (redundancy because there will be a lot of read queries here)
- name
- vocabulary (a JSON containing list of sentences in the content and details of each word of the sentence + meaning)
- grammar (a JSON list containing grammatical structures used in each sentence, refers to sentence by index)
- quiz (a JSON list of questions, MCQ options, and the index of the correct answer to test comprehension of the material)

# Vocabulary Bank

Vocabulary bank stores all known vocabulary and combinations of it. All new vocabs from a learned material will be added to the bank.

This is used in the mobile and web app to know words we have learned and can review them when needed.

It stores references to the building blocks of the word (available for Chinese & Japanese).
For example: when a word is 水果 then it will store references to 水 and 果 and can jump to know its meaning.

It also stores references to the materials' sentences as example sentences.

Vocabulary Bank entity：
- original_word
- pronunciation (pinyin, hiragana, or phonetic alphabet)
- meaning (JSON we have a structure for this later)

Vocabulary Bank References entity:
- vocabulary_id
- referred_vocabulary_id

Vocabulary Bank Sentences entity:
- vocabulary_id
- material_id
- sentence_index

Endpoints:
- GET /api/vocabularies -> Fetches all vocabularies for the user, but excluding the relationships.
- GET /api/vocabularies/{id} -> Fetches all references & sentence banks for that vocabulary
- POST /api/vocabularies
- PUT /api/vocabularies/{id}
- DELETE /api/vocabularies/{id}

# Integration of all Features

- When resource processing queue is done:
  - Create material based on the AI's response.
  - Upsert vocabulary bank information based on the transcript.
  - Update example sentences of all existing vocabs, don't insert if the same sentence already exist.
  - Mark the resource queue entry to be done.
  
# Media Processing Pipeline

- If the URL is YouTube video, use the Gemini's YouTube video feature to insert it.
- If the URL is article, then fetch the site then provide to AI to extract only the article/content.
- Other providers will have its own processor, but later: x (twitter), mastodon, facebook, reddit, etc.
- Else, process uploaded asset as just file to feed to the AI model.