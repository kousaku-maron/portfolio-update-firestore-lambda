import * as admin from 'firebase-admin'
import axios from 'axios'
import serviceAccount from './serviceAccountKey.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export const hello = async (event, context, callback) => {
  const db = admin.firestore()
  const collection = db.collection(process.env.collection)

  // const res = await axios.get(process.env.endpoint)
  const res = await axios({
    method: 'get',
    url: process.env.endpoint,
  })

  if(res.data) {
    Promise.all(res.data.map(async element => {
      const record = {
        id: element.id,
        name: element.name,
        full_name: element.full_name,
        html_url: element.html_url,
        description: element.description,
        created_at: element.created_at,
        updated_at: element.updated_at,
        language: element.language,
        stargazers_count: element.stargazers_count,
        watchers_count: element.watchers_count,
      }

      await collection.doc(element.id.toString()).set(record)
        .then(() => console.log(`add ${element.id} record.`))
        .catch(error => callback(error))
    }))
  }

  callback(null, {
    message: 'write success.',
    event,
  })
}
