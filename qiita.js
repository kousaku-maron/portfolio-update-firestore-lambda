import * as admin from 'firebase-admin'
import axios from 'axios'
import serviceAccount from './serviceAccountKey.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export const hello = async (event, context, callback) => {
  const db = admin.firestore()
  const collection = db.collection(process.env.collection)
  
  const res = await axios({
    method: 'get',
    url: process.env.endpoint,
    params: {
      page: 1,
      per_page: 100,
    }
  })

  if(res.data) {
    Promise.all(res.data.map(async element => {
      const record = {
        id: element.id,
        title: element.title,
        url: element.url,
        likes_count: element.likes_count,
        created_at: element.created_at,
        updated_at: element.updated_at,
        tags: element.tags,
      }

      await collection.doc(element.id).set(record)
      .then(() => console.log(`add ${element.id} record.`))
      .catch(error => callback(error))
    }))
  }

  callback(null, {
    message: 'write success.',
    event,
  })
}
