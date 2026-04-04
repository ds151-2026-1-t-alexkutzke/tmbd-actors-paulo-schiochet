import { Link, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, FlatList, Pressable } from 'react-native';
import { api } from '../../src/api/tmdb';

interface ActorDetails {
  name: string;
  biography: string;
  profile_path: string | null;
}

interface MovieCredit {
  id: number;
  title: string;
  poster_path: string | null;
  character: string;
  release_date: string;
}

export default function ActorDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [movies, setMovies] = useState<MovieCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActorData = async () => {
      try {
        const [actorResponse, creditsResponse] = await Promise.all([
          api.get(`/person/${id}`),
          api.get(`/person/${id}/movie_credits`),
        ]);

        setActor(actorResponse.data);
        setMovies(creditsResponse.data.cast || []);
      } catch (error) {
        console.error('Erro ao buscar detalhes do ator:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActorData();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!actor) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Ator não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* tratamento */}
      {actor.profile_path ? (
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${actor.profile_path}`,
          }}
          style={styles.photo}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>Sem Foto</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{actor.name}</Text>
        {/* Biografia com fb */}
        <Text style={styles.sectionTitle}>Biografia</Text>
        <Text style={styles.biography}>
          {actor.biography || 'Biografia não disponível para este artista.'}
        </Text>

        {/* filmografia clicavel */}
        <Text style={styles.sectionTitle}>Filmografia</Text>
        <FlatList
          data={movies}
          horizontal={true}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Link href={`/movie/${item.id}`} asChild>
              <Pressable style={styles.movieCard}>
                {item.poster_path ? (
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/w185${item.poster_path}`,
                    }}
                    style={styles.moviePoster}
                  />
                ) : (
                  <View style={styles.moviePosterPlaceholder}>
                    <Text style={styles.placeholderText}>Sem{'\n'}Imagem</Text>
                  </View>
                )}
                <Text style={styles.movieTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.character ? (
                  <Text style={styles.movieCharacter} numberOfLines={1}>
                    {item.character}
                  </Text>
                ) : null}
              </Pressable>
            </Link>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  photo: { width: '100%', height: 400 },
  photoPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center'
  },
  photoPlaceholderText: {
    color: '#9CA3AF',
    fontSize: 18
  },
  content: { padding: 20 },
  name: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16
  },
  biography: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 24
  },
  movieCard: {
    width: 120,
    marginRight: 12
  },
  moviePoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 6
  },
  moviePosterPlaceholder: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center'
  },
  movieTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  movieCharacter: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2
  },
  errorText: { color: '#FFFFFF', fontSize: 18 },
});
