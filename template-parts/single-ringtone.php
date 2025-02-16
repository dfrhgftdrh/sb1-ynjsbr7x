<?php
/**
 * Template part for displaying single ringtones
 */
$downloads = get_post_meta(get_the_ID(), '_download_count', true) ?: 0;
$duration = get_post_meta(get_the_ID(), '_ringtone_duration', true);
$file_url = get_post_meta(get_the_ID(), '_file_url', true);
?>

<div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
        <div class="bg-[#1a1b2e]/50 rounded-3xl border border-pink-500/20 p-8">
            <!-- Stats Bar -->
            <div class="flex items-center justify-between mb-6 pb-6 border-b border-pink-500/20">
                <div class="flex items-center text-gray-300">
                    <i data-lucide="download" class="text-pink-500 w-5 h-5 mr-2"></i>
                    <span class="text-2xl font-bold"><?php echo number_format($downloads); ?></span>
                    <span class="ml-2 text-gray-400"><?php _e('downloads', 'ringbuz'); ?></span>
                </div>
                <div class="flex items-center text-gray-400">
                    <i data-lucide="calendar" class="w-5 h-5 mr-2"></i>
                    <span><?php echo get_the_date(); ?></span>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-8">
                <div class="w-full md:w-1/2">
                    <div class="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 relative">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="flex flex-col items-center">
                                <button onclick="playRingtone('<?php echo esc_attr($file_url); ?>')"
                                        class="w-20 h-20 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center transition-all transform hover:scale-110 mb-3">
                                    <i data-lucide="play" class="w-8 h-8 text-white"></i>
                                </button>
                                <?php if ($duration): ?>
                                    <div class="flex items-center text-white bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                                        <i data-lucide="clock" class="w-4 h-4 mr-2"></i>
                                        <?php echo esc_html(gmdate("i:s", $duration)); ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="w-full md:w-1/2">
                    <div class="flex items-center gap-2 mb-4">
                        <i data-lucide="music" class="text-pink-500 w-6 h-6"></i>
                        <h1 class="text-3xl font-bold text-white"><?php the_title(); ?></h1>
                    </div>

                    <div class="text-gray-300 mb-6">
                        <?php the_content(); ?>
                    </div>

                    <div class="space-y-4 mb-8">
                        <a href="<?php echo esc_url(get_author_posts_url(get_the_author_meta('ID'))); ?>" 
                           class="flex items-center text-gray-400 hover:text-pink-400 transition-colors">
                            <i data-lucide="user" class="w-4 h-4 mr-2"></i>
                            <?php the_author(); ?>
                        </a>

                        <?php
                        $tags = get_the_terms(get_the_ID(), 'content_tag');
                        if ($tags): ?>
                            <div class="flex flex-wrap gap-2">
                                <?php foreach ($tags as $tag): ?>
                                    <a href="<?php echo get_term_link($tag); ?>" 
                                       class="flex items-center px-3 py-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-full text-sm transition-colors">
                                        <i data-lucide="tag" class="w-3 h-3 mr-1"></i>
                                        <?php echo esc_html($tag->name); ?>
                                    </a>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="flex gap-4">
                        <button onclick="downloadRingtone(<?php echo get_the_ID(); ?>)"
                                class="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg py-3 hover:opacity-90 transition-all flex items-center justify-center">
                            <i data-lucide="download" class="w-5 h-5 mr-2"></i>
                            <?php _e('Download', 'ringbuz'); ?>
                        </button>
                        
                        <button onclick="shareContent('<?php the_title(); ?>', '<?php the_permalink(); ?>')"
                                class="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                            <i data-lucide="share-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <?php
        // Related ringtones
        $related = get_posts(array(
            'post_type' => 'ringtone',
            'posts_per_page' => 5,
            'post__not_in' => array(get_the_ID()),
            'tax_query' => array(
                array(
                    'taxonomy' => 'ringtone_category',
                    'field' => 'id',
                    'terms' => wp_get_post_terms(get_the_ID(), 'ringtone_category', array('fields' => 'ids'))
                )
            )
        ));

        if ($related): ?>
            <div class="mt-12">
                <h2 class="text-2xl font-bold text-white mb-6"><?php _e('Related Ringtones', 'ringbuz'); ?></h2>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    <?php foreach ($related as $post):
                        setup_postdata($post);
                        get_template_part('template-parts/content', 'ringtone');
                    endforeach;
                    wp_reset_postdata(); ?>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>