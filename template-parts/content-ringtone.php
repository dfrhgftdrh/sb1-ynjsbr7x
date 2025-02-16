<?php
/**
 * Template part for displaying ringtones
 */
?>
<article id="post-<?php the_ID(); ?>" <?php post_class('group relative'); ?>>
    <div class="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 relative">
        <div class="absolute inset-0 flex items-center justify-center">
            <button class="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center transition-all transform group-hover:scale-110"
                    onclick="playRingtone('<?php echo esc_attr(get_post_meta(get_the_ID(), '_file_url', true)); ?>')">
                <i data-lucide="play" class="w-6 h-6 text-white"></i>
            </button>
        </div>
    </div>

    <div class="mt-3">
        <a href="<?php the_permalink(); ?>" class="text-white hover:text-pink-400 transition-colors line-clamp-1">
            <?php the_title(); ?>
        </a>
        <div class="flex items-center justify-between mt-1">
            <a href="<?php echo esc_url(get_author_posts_url(get_the_author_meta('ID'))); ?>" 
               class="flex items-center text-sm text-gray-400 hover:text-pink-400 transition-colors">
                <i data-lucide="user" class="w-3.5 h-3.5 mr-1"></i>
                <?php the_author(); ?>
            </a>
            <div class="flex items-center gap-2">
                <div class="text-sm text-gray-400">
                    <i data-lucide="download" class="w-3.5 h-3.5 inline mr-1"></i>
                    <?php echo number_format(get_post_meta(get_the_ID(), '_download_count', true) ?: 0); ?>
                </div>
            </div>
        </div>
    </div>
</article>