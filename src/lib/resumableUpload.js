import * as tus from 'tus-js-client'
import { supabase } from './supabase'

export async function resumableUpload(bucket, path, file, onProgress) {
  const { data } = await supabase.auth.getSession()
  if (!data.session) throw new Error('Session expired. Please sign in again.')
  const ref = new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]
  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: 'https://' + ref + '.storage.supabase.co/storage/v1/upload/resumable',
      retryDelays: [0, 3000, 5000, 10000, 20000, 30000],
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        'x-upsert': 'false',
      },
      uploadDataDuringCreation: true,
      storeFingerprintForResuming: false,
      chunkSize: 6 * 1024 * 1024,
      metadata: {
        bucketName: bucket,
        objectName: path,
        contentType: file.type,
        cacheControl: '31536000',
      },
      onBeforeRequest: async (req) => {
        const { data: fresh } = await supabase.auth.getSession()
        const token = fresh.session ? fresh.session.access_token : data.session.access_token
        req.setHeader('Authorization', 'Bearer ' + token)
      },
      onError: reject,
      onProgress: (sent, total) => onProgress(Math.round((sent / total) * 100)),
      onSuccess: resolve,
    })
    upload.start()
  })
}
